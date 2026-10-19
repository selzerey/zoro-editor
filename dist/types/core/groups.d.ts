import type { GroupName, PresetName, ToolbarGroup } from '../types';
/** Built-in groups. Order = order in the toolbar. */
export declare const BUILTIN_GROUPS: ToolbarGroup[];
export declare const PRESETS: Record<string, GroupName[]>;
export declare function registerGroup(group: ToolbarGroup): void;
export declare function registerPreset(name: PresetName, groups: GroupName[]): void;
export declare function getGroup(name: GroupName): ToolbarGroup | undefined;
/**
 * preset + groups + addGroups + removeGroups → final group list (built-in order is kept,
 * custom groups are appended).
 */
export declare function resolveGroups(o: {
    preset?: PresetName;
    groups?: GroupName[];
    addGroups?: GroupName[];
    removeGroups?: GroupName[];
}): GroupName[];
export declare const COLORS: string[];
export declare const CELL_COLORS: string[];
export declare const SPECIAL_CHARS: string[];
