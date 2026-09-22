interface IllustrationProps {
    className?: string;
}

export function CupcakeIllustration({ className = '' }: IllustrationProps) {
    return <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
        <path d="M28 44h40l-5 37H33z" fill="#6CCFCB" stroke="#389DA6" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M35 48l3 29M48 48v30M61 48l-3 29" stroke="#E9FFFF" strokeWidth="3" strokeLinecap="round" opacity=".75"/>
        <path d="M25 45c-5-8 1-17 11-17 2-10 17-14 24-5 10-2 18 7 14 16 7 8-1 14-8 14H33c-7 0-12-3-8-8z" fill="#FFB5C5" stroke="#E87891" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M42 34c4-4 10-4 14 0" fill="none" stroke="#FFF5F7" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="38" cy="43" r="2" fill="#76506A"/><circle cx="58" cy="43" r="2" fill="#76506A"/>
        <path d="M43 47c3 3 7 3 10 0" fill="none" stroke="#76506A" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="48" cy="15" r="6" fill="#FF6F72" stroke="#D9515D" strokeWidth="2"/>
        <path d="M48 10c0-5 3-8 7-9" fill="none" stroke="#59A463" strokeWidth="3" strokeLinecap="round"/>
    </svg>;
}

export function AcornFriendIllustration({ className = '' }: IllustrationProps) {
    return <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
        <path d="M48 23c18 0 29 14 24 32-4 15-16 28-24 34-8-6-20-19-24-34-5-18 6-32 24-32z" fill="#E6AD68" stroke="#A86C3F" strokeWidth="3"/>
        <path d="M23 36c2-15 13-25 25-25s23 10 25 25c-16 6-34 6-50 0z" fill="#9B633B" stroke="#704329" strokeWidth="3"/>
        <path d="M48 11c0-7 5-11 11-12" fill="none" stroke="#6AAE63" strokeWidth="5" strokeLinecap="round"/>
        <path d="M55 8c7-5 14-2 17 3-7 5-13 5-17-3z" fill="#8ACB73" stroke="#559C52" strokeWidth="2"/>
        <circle cx="38" cy="54" r="2.5" fill="#624438"/><circle cx="58" cy="54" r="2.5" fill="#624438"/>
        <path d="M42 61c4 4 8 4 12 0" fill="none" stroke="#624438" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="32" cy="61" r="4" fill="#F38A86" opacity=".65"/><circle cx="64" cy="61" r="4" fill="#F38A86" opacity=".65"/>
    </svg>;
}

export function CookieFriendIllustration({ className = '' }: IllustrationProps) {
    return <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
        <circle cx="48" cy="48" r="38" fill="#F7D58D" stroke="#D59D51" strokeWidth="3"/>
        <circle cx="31" cy="30" r="4" fill="#9A663E"/><circle cx="64" cy="27" r="5" fill="#9A663E"/>
        <circle cx="70" cy="58" r="4" fill="#9A663E"/><circle cx="29" cy="68" r="5" fill="#9A663E"/>
        <circle cx="38" cy="48" r="2.5" fill="#654536"/><circle cx="57" cy="48" r="2.5" fill="#654536"/>
        <path d="M41 56c5 5 10 5 15 0" fill="none" stroke="#654536" strokeWidth="3" strokeLinecap="round"/>
        <path d="M18 45c3-2 6-2 9 0M69 72c3-2 6-2 9 0" fill="none" stroke="#FFF2C9" strokeWidth="3" strokeLinecap="round"/>
    </svg>;
}

export function RainbowCloudIllustration({ className = '' }: IllustrationProps) {
    return <svg viewBox="0 0 150 92" className={className} aria-hidden="true">
        <path d="M27 70a48 48 0 0196 0" fill="none" stroke="#FF9A91" strokeWidth="11" strokeLinecap="round"/>
        <path d="M38 70a37 37 0 0174 0" fill="none" stroke="#FFD56B" strokeWidth="10" strokeLinecap="round"/>
        <path d="M50 70a25 25 0 0150 0" fill="none" stroke="#74D4C8" strokeWidth="10" strokeLinecap="round"/>
        <path d="M6 73c0-10 10-17 20-13 4-9 18-9 22 1 12-1 17 14 8 21H14C9 82 6 78 6 73zm88 0c0-10 10-17 20-13 4-9 18-9 22 1 12-1 17 14 8 21h-42c-5 0-8-4-8-9z" fill="#FFF" stroke="#CBEAF2" strokeWidth="3"/>
    </svg>;
}

export function PlayfulWheelBackdrop() {
    return <div data-playful-illustrations className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <RainbowCloudIllustration className="absolute -left-7 top-8 hidden w-40 -rotate-6 opacity-80 sm:block lg:left-8 lg:w-48"/>
        <CupcakeIllustration className="absolute -right-3 top-16 hidden w-24 rotate-6 opacity-80 sm:block lg:right-12 lg:w-28"/>
        <CookieFriendIllustration className="absolute -left-8 top-[48%] w-20 -rotate-12 opacity-25 sm:w-28"/>
        <AcornFriendIllustration className="absolute -right-8 top-[62%] w-20 rotate-12 opacity-25 sm:w-28"/>
        <span className="absolute left-[8%] top-[30%] h-4 w-4 rounded-full bg-[#ffd96f]/45"/>
        <span className="absolute right-[11%] top-[39%] h-6 w-6 rounded-full bg-[#8eddd2]/35"/>
        <span className="absolute bottom-[12%] left-[14%] h-3 w-3 rounded-full bg-[#ffaaa1]/40"/>
    </div>;
}

export function PlayfulJoyBanner() {
    return <div className="mx-auto mt-6 flex w-fit max-w-full items-center gap-2 rounded-full border-2 border-white bg-white/80 px-3 py-2 shadow-[0_6px_0_rgba(126,198,208,.2)] sm:gap-3 sm:px-5">
        <CupcakeIllustration className="h-9 w-9 shrink-0 -rotate-6 sm:h-11 sm:w-11"/>
        <p className="text-center text-xs font-black text-[#42677c] sm:text-sm">Bánh nhỏ xinh · Niềm vui thật trong veo</p>
        <AcornFriendIllustration className="h-9 w-9 shrink-0 rotate-6 sm:h-11 sm:w-11"/>
    </div>;
}
