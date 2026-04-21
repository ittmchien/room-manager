export declare const FEATURE_KEYS: {
    readonly ROOMS_SLOT: "rooms_slot";
    readonly ROOMS_50: "rooms_50";
    readonly MULTI_PROPERTY: "multi_property";
    readonly CONTRACTS: "contracts";
    readonly FINANCIAL_REPORTS: "financial_reports";
    readonly EXPENSES: "expenses";
    readonly REMOVE_ADS: "remove_ads";
};
export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];
export declare const FREE_ROOM_LIMIT = 10;
export declare const FREE_PROPERTY_LIMIT = 1;
