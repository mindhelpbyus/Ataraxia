/**
 * api/jitsi.ts — REMOVED
 */
export function getJitsiConfig(..._args: any[]): any {
    return { configOverwrite: {} };
}

export function getJitsiDomain(): string {
    return 'meet.jit.si';
}

export function generateRoomName(..._args: any[]): string {
    return 'room-' + Math.random().toString(36).substring(7);
}
