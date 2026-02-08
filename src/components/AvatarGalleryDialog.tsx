import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Check } from 'lucide-react';

// Import individual female avatars
import femaleAvatar1 from 'figma:asset/c6a8012d085406c7b2c21260872106b2bf092301.png';
import femaleAvatar2 from 'figma:asset/3ddddbfa7831ca72c68918d3a3b3858ad09a139f.png';
import femaleAvatar3 from 'figma:asset/c5ebbc448f2bdb48c1b593835aecf59e38fd6f7a.png';
import femaleAvatar4 from 'figma:asset/fe180646e16f662054fd89712e863a00e980e863.png';
import femaleAvatar5 from 'figma:asset/a1c4421daf4079d238f4f9001e9760a6ca4df75b.png';
import femaleAvatar6 from 'figma:asset/685c82696152b574719b6b815c36bb20abd13fea.png';
import femaleAvatar7 from 'figma:asset/03bc8d7937ccec1494a6f156ee51fc9204a5f82f.png';
import femaleAvatar8 from 'figma:asset/74959c662a8f999988168d82564413b88a4aaa31.png';
import femaleAvatar9 from 'figma:asset/1284f3059326cd701b1253ae2898ea3903c8d755.png';
import femaleAvatar10 from 'figma:asset/1b314477241148033df8c182b94fce88c9c7b0d3.png';
import femaleAvatar11 from 'figma:asset/33b04e1e3236596421a7d284a0adb6bae6234973.png';
import femaleAvatar12 from 'figma:asset/db39555e8282eac639dc5ea3dcf71f38f0d0237c.png';

// Import individual male avatars
import maleAvatar1 from 'figma:asset/207219d08ab4c885b16364e6d0e8883bd972fc18.png';
import maleAvatar2 from 'figma:asset/c669c69ad9e27096cfe5097210c6c0d44b3547de.png';
import maleAvatar3 from 'figma:asset/797d6e30272a9a28425fbd8e8ae6414adbeecd9f.png';
import maleAvatar4 from 'figma:asset/ed756cbe73868c9b57650471ca953d70f15259c3.png';
import maleAvatar5 from 'figma:asset/445c848f796e5ad3beee53723473d95a0af90c08.png';
import maleAvatar6 from 'figma:asset/a4bcbc3021f4158d09d75ff0e4dad0c656ff9d09.png';
import maleAvatar7 from 'figma:asset/7ff385676197aaf5443a6f640e8ab0494facd956.png';
import maleAvatar8 from 'figma:asset/15ab56032c0cc137dbf4823a3c93d0fa41cba630.png';
import maleAvatar9 from 'figma:asset/ea8ca646e82e65767f35de3e6ec5846408d537b9.png';
import maleAvatar10 from 'figma:asset/1e09341c95db1952287d118b43e75f4da6286c32.png';
import maleAvatar11 from 'figma:asset/47bdd6b96c152187a49d32fa7d8d4d1357908643.png';
import maleAvatar12 from 'figma:asset/54d7c4b859eebc0233975ee42cac1d09c7ae4a73.png';
import maleAvatar13 from 'figma:asset/2a4bc9afebb3d849c2e22508118e16d57de8fa85.png';
import maleAvatar14 from 'figma:asset/a053f2430c7759e18ab2f3b176844d5a117eb594.png';

interface AvatarGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAvatar: (avatarUrl: string) => void;
  selectedAvatar?: string | null;
  gender?: string | null;
}

// Avatar options (Female and Male)
const AVATAR_OPTIONS = [
  {
    id: 'female-avatar-1',
    url: femaleAvatar1,
    label: 'Blue Hair Character',
    gender: 'female'
  },
  {
    id: 'female-avatar-2',
    url: femaleAvatar2,
    label: 'Pink Hair Character',
    gender: 'female'
  },
  {
    id: 'female-avatar-3',
    url: femaleAvatar3,
    label: 'Colorful Buns Character',
    gender: 'female'
  },
  {
    id: 'female-avatar-4',
    url: femaleAvatar4,
    label: 'Blonde Hair Character',
    gender: 'female'
  },
  {
    id: 'female-avatar-5',
    url: femaleAvatar5,
    label: 'Orange Hair Character',
    gender: 'female'
  },
  {
    id: 'female-avatar-6',
    url: femaleAvatar6,
    label: 'Black Hair Character',
    gender: 'female'
  },
  {
    id: 'female-avatar-7',
    url: femaleAvatar7,
    label: 'Purple Hat Character',
    gender: 'female'
  },
  {
    id: 'female-avatar-8',
    url: femaleAvatar8,
    label: 'Professional Character',
    gender: 'female'
  },
  {
    id: 'female-avatar-9',
    url: femaleAvatar9,
    label: 'Glasses & Blue Collar Character',
    gender: 'female'
  },
  {
    id: 'female-avatar-10',
    url: femaleAvatar10,
    label: 'Brown Glasses Character',
    gender: 'female'
  },
  {
    id: 'female-avatar-11',
    url: femaleAvatar11,
    label: 'Black Hair Business Character',
    gender: 'female'
  },
  {
    id: 'female-avatar-12',
    url: femaleAvatar12,
    label: 'Auburn Hair Professional Character',
    gender: 'female'
  },
  {
    id: 'male-avatar-1',
    url: maleAvatar1,
    label: 'Bearded Character',
    gender: 'male'
  },
  {
    id: 'male-avatar-2',
    url: maleAvatar2,
    label: 'Curly Hair Character',
    gender: 'male'
  },
  {
    id: 'male-avatar-3',
    url: maleAvatar3,
    label: 'Bald Character',
    gender: 'male'
  },
  {
    id: 'male-avatar-4',
    url: maleAvatar4,
    label: 'Wavy Hair Character',
    gender: 'male'
  },
  {
    id: 'male-avatar-5',
    url: maleAvatar5,
    label: 'Afro Character',
    gender: 'male'
  },
  {
    id: 'male-avatar-6',
    url: maleAvatar6,
    label: 'Red Bearded Character',
    gender: 'male'
  },
  {
    id: 'male-avatar-7',
    url: maleAvatar7,
    label: 'Brown Hair Character',
    gender: 'male'
  },
  {
    id: 'male-avatar-8',
    url: maleAvatar8,
    label: 'Glasses Character',
    gender: 'male'
  },
  {
    id: 'male-avatar-9',
    url: maleAvatar9,
    label: 'Hoodie Character',
    gender: 'male'
  },
  {
    id: 'male-avatar-10',
    url: maleAvatar10,
    label: 'Orange Wavy Hair Character',
    gender: 'male'
  },
  {
    id: 'male-avatar-11',
    url: maleAvatar11,
    label: 'Pink Curly Hair Character',
    gender: 'male'
  },
  {
    id: 'male-avatar-12',
    url: maleAvatar12,
    label: 'Business Professional Orange Tie',
    gender: 'male'
  },
  {
    id: 'male-avatar-13',
    url: maleAvatar13,
    label: 'Business Professional Red Tie',
    gender: 'male'
  },
  {
    id: 'male-avatar-14',
    url: maleAvatar14,
    label: 'Business Professional Blue Tie',
    gender: 'male'
  },
];

export function AvatarGalleryDialog({
  open,
  onOpenChange,
  onSelectAvatar,
  selectedAvatar,
  gender,
}: AvatarGalleryDialogProps) {
  // Use ID for selection to avoid multiple selections with same URL
  const [tempSelectedId, setTempSelectedId] = useState<string | null>(() => {
    // Find the ID of the currently selected avatar by its URL
    const currentAvatar = AVATAR_OPTIONS.find(av => av.url === selectedAvatar);
    return currentAvatar?.id || null;
  });

  const [filter, setFilter] = useState<string>('all');

  // Update filter when dialog opens or gender changes
  React.useEffect(() => {
    if (open) {
      if (gender === 'female') setFilter('female');
      else if (gender === 'male') setFilter('male');
      else setFilter('all');
    }
  }, [open, gender]);

  const handleSelect = (avatarId: string) => {
    setTempSelectedId(avatarId);
  };

  const handleConfirm = () => {
    if (tempSelectedId) {
      const selectedAvatarData = AVATAR_OPTIONS.find(av => av.id === tempSelectedId);
      if (selectedAvatarData) {
        onSelectAvatar(selectedAvatarData.url);
        onOpenChange(false);
      }
    }
  };

  const filteredAvatars = AVATAR_OPTIONS.filter(avatar => {
    if (filter === 'all') return true;
    return avatar.gender === filter;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Profile Avatar</DialogTitle>
          <DialogDescription>
            Select an illustrated avatar for your profile
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 my-2">
          <Button
            variant={filter === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter('all')}
            className="rounded-full"
          >
            All
          </Button>
          <Button
            variant={filter === 'female' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter('female')}
            className="rounded-full"
          >
            Female
          </Button>
          <Button
            variant={filter === 'male' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter('male')}
            className="rounded-full"
          >
            Male
          </Button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 py-4">
          {filteredAvatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar.id)}
              className={`relative aspect-square rounded-full overflow-hidden border-4 transition-all hover:scale-105 ${tempSelectedId === avatar.id
                ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2'
                : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              {/* Avatar image */}
              <img
                src={avatar.url}
                alt={avatar.label}
                className="w-full h-full object-cover"
              />

              {tempSelectedId === avatar.id && (
                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                  <div className="bg-blue-600 rounded-full p-2">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!tempSelectedId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
