export function formatStaffCode(sequence: number): string {
    return `NV${Math.max(1, Math.trunc(sequence)).toString().padStart(6, '0')}`;
}
