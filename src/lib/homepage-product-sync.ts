import mongoose from 'mongoose';
import Product from '@/models/Product';
import {
    HOMEPAGE_SECTION_CONFIG,
    prioritizeHomepageProductIds,
    type HomepageSection,
} from '@/lib/homepage-products';

const SECTION_KEYS = Object.keys(HOMEPAGE_SECTION_CONFIG) as HomepageSection[];

type HomepageSelectionInput = Partial<Record<
    typeof HOMEPAGE_SECTION_CONFIG[HomepageSection]['field'],
    boolean
>>;

export async function synchronizeProductHomepageSelections(
    productId: mongoose.Types.ObjectId | string,
    selections: HomepageSelectionInput,
) {
    const currentId = String(productId);

    for (const section of SECTION_KEYS) {
        const config = HOMEPAGE_SECTION_CONFIG[section];
        if (selections[config.field] !== true) continue;

        const eligibilityFilter = config.linkedOnly
            ? { isLinkedProduct: true }
            : { isLinkedProduct: { $ne: true } };
        const effectiveSelectionFilter = config.legacyTag
            ? {
                $or: [
                    { [config.field]: true },
                    { [config.field]: { $exists: false }, tags: config.legacyTag },
                ],
            }
            : {
                $or: [
                    { [config.field]: true },
                    { [config.field]: { $exists: false } },
                ],
            };

        const existingProducts = await Product.find({
            ...eligibilityFilter,
            ...effectiveSelectionFilter,
            _id: { $ne: productId },
        })
            .sort({ sortOrder: -1, createdAt: -1 })
            .limit(Math.max(config.limit - 1, 0))
            .select('_id')
            .lean();

        const selectedIds = prioritizeHomepageProductIds(
            currentId,
            existingProducts.map(product => product._id.toString()),
            config.limit,
        ).map(id => new mongoose.Types.ObjectId(id));

        await Product.updateMany(
            eligibilityFilter,
            [{ $set: { [config.field]: { $in: ['$_id', selectedIds] } } }],
            { updatePipeline: true },
        );
    }
}
