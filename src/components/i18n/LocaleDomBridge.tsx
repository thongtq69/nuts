'use client';

import { useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { translateLoose } from '@/i18n/messages';

const EXCLUDED_CONTENT = [
    '.blog-content',
    '.product-description-modern',
    '.description-content',
    '.about-rich-content',
    '.prose',
    '[data-no-auto-translate]',
].join(',');

type TextTranslation = { original: string; translated: string };
type AttributeTranslations = Record<string, TextTranslation>;

const textTranslations = new WeakMap<Text, TextTranslation>();
const attributeTranslations = new WeakMap<Element, AttributeTranslations>();
const TRANSLATED_ATTRIBUTES = ['placeholder', 'title', 'aria-label'];

function isExcluded(node: Node): boolean {
    const element = node instanceof Element ? node : node.parentElement;
    if (!element) return false;
    return Boolean(element.closest(EXCLUDED_CONTENT)) || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName);
}

export default function LocaleDomBridge() {
    const { locale } = useLocale();

    useEffect(() => {
        const translateTextNode = (node: Text) => {
            if (isExcluded(node)) return;
            const current = node.data;
            const previous = textTranslations.get(node);

            if (locale === 'vi') {
                if (previous && current === previous.translated) node.data = previous.original;
                return;
            }

            if (previous && current === previous.translated) return;
            const translated = translateLoose(locale, current);
            textTranslations.set(node, { original: current, translated });
            if (translated !== current) node.data = translated;
        };

        const translateElement = (element: Element) => {
            if (isExcluded(element)) return;
            const saved = attributeTranslations.get(element) || {};

            for (const attribute of TRANSLATED_ATTRIBUTES) {
                const current = element.getAttribute(attribute);
                if (!current) continue;
                const previous = saved[attribute];

                if (locale === 'vi') {
                    if (previous && current === previous.translated) element.setAttribute(attribute, previous.original);
                    continue;
                }

                if (previous && current === previous.translated) continue;
                const translated = translateLoose(locale, current);
                saved[attribute] = { original: current, translated };
                if (translated !== current) element.setAttribute(attribute, translated);
            }

            attributeTranslations.set(element, saved);
        };

        const processNode = (root: Node) => {
            if (root instanceof Text) {
                translateTextNode(root);
                return;
            }
            if (root instanceof Element) translateElement(root);
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
            let current = walker.nextNode();
            while (current) {
                if (current instanceof Text) translateTextNode(current);
                else if (current instanceof Element) translateElement(current);
                current = walker.nextNode();
            }
        };

        processNode(document.body);
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'characterData') processNode(mutation.target);
                else if (mutation.type === 'attributes') processNode(mutation.target);
                else mutation.addedNodes.forEach(processNode);
            }
        });
        observer.observe(document.body, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: TRANSLATED_ATTRIBUTES,
        });

        return () => observer.disconnect();
    }, [locale]);

    return null;
}
