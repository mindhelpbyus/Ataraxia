/**
 * api/jitsi.ts — REMOVED
 */
export function getJitsiConfig(...args: any[]): any {
    return { configOverwrite: {} };
}

export function getJitsiDomain(): string {
    return 'meet.jit.si';
}

export function generateRoomName(...args: any[]): string {
    return 'room-' + Math.random().toString(36).substring(7);
}
