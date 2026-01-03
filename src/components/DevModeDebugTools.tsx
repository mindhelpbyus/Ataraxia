/**
 * Dev Mode Debug Tools
 * Wrapper component that shows debug panels in development mode
 * Includes API Debug Panel and Error Debug Display
 * 
 * Note: In Figma Make environment, these are always enabled for debugging
 */

import { ApiDebugPanel } from './ApiDebugPanel';
import { DebugErrorDisplay } from './DebugErrorDisplay';
import { UserRole } from '../types/appointment';

interface DevModeDebugToolsProps {
  userRole?: UserRole;
}

export function DevModeDebugTools({ userRole }: DevModeDebugToolsProps) {
  // Debug tools visibility is now controlled by each component based on role and environment
  
  return (
    <>
      <ApiDebugPanel userRole={userRole} />
      <DebugErrorDisplay userRole={userRole} />
    </>
  );
}