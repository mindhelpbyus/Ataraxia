/**
 * components/atoms/index.ts
 *
 * ATOMS: The smallest indivisible UI building blocks.
 * These are stateless, highly reusable primitives with no business logic.
 *
 * Chief Architect Atomic Design §4 (FRONTEND_ARCHITECTURE.md)
 *
 * All atoms re-export from their canonical locations so:
 *   ✅ Old imports: import { Button } from '../ui/button'  -- still work
 *   ✅ New imports: import { Button } from '@/components/atoms' -- also work
 */

// ─── Form Inputs ──────────────────────────────────────────────────────────────
export { Button } from '../ui/button';
export { Input } from '../ui/input';
export { Label } from '../ui/label';
export { Checkbox } from '../ui/checkbox';
export { RadioGroup, RadioGroupItem } from '../ui/radio-group';
export { Switch } from '../ui/switch';
export { Slider } from '../ui/slider';
export { Textarea } from '../ui/textarea';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// ─── Display ──────────────────────────────────────────────────────────────────
export { Badge } from '../ui/badge';
export { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
export { Separator } from '../ui/separator';
export { Skeleton } from '../ui/skeleton';
export { Progress } from '../ui/progress';
export { AspectRatio } from '../ui/aspect-ratio';

// ─── Feedback ─────────────────────────────────────────────────────────────────
export { Alert, AlertTitle, AlertDescription } from '../ui/alert';
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
export { Toaster } from '../ui/sonner';
