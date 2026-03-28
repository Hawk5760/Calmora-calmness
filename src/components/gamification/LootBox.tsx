import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export interface LootReward {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'legendary';
  type: 'garden_plant' | 'badge' | 'xp_boost' | 'theme';
  description: string;
}

const LOOT_POOL: LootReward[] = [
  { id: 'cherry_blossom', name: 'Cherry Blossom', emoji: '🌸', rarity: 'common', type: 'garden_plant', description: 'A delicate pink bloom for your garden' },
  { id: 'sunflower', name: 'Sunflower', emoji: '🌻', rarity: 'common', type: 'garden_plant', description: 'A bright sunflower radiating warmth' },
  { id: 'cactus', name: 'Desert Cactus', emoji: '🌵', rarity: 'common', type: 'garden_plant', description: 'A resilient cactus — just like you' },
  { id: 'tulip', name: 'Rainbow Tulip', emoji: '🌷', rarity: 'common', type: 'garden_plant', description: 'A colorful tulip bringing joy' },
  { id: 'xp_10', name: 'XP Boost (10)', emoji: '⚡', rarity: 'common', type: 'xp_boost', description: '+10 bonus XP' },
  { id: 'rose', name: 'Crystal Rose', emoji: '🌹', rarity: 'rare', type: 'garden_plant', description: 'A rare crystalline rose' },
  { id: 'bonsai', name: 'Ancient Bonsai', emoji: '🌳', rarity: 'rare', type: 'garden_plant', description: 'A centuries-old wisdom tree' },
  { id: 'mushroom', name: 'Glowing Mushroom', emoji: '🍄', rarity: 'rare', type: 'garden_plant', description: 'Bioluminescent forest magic' },
  { id: 'xp_25', name: 'XP Boost (25)', emoji: '💎', rarity: 'rare', type: 'xp_boost', description: '+25 bonus XP' },
  { id: 'zen_badge', name: 'Zen Master Badge', emoji: '🧘', rarity: 'rare', type: 'badge', description: 'A mark of inner peace' },
  { id: 'aurora_flower', name: 'Aurora Flower', emoji: '🪻', rarity: 'legendary', type: 'garden_plant', description: 'A flower that glows with northern lights' },
  { id: 'world_tree', name: 'World Tree Sapling', emoji: '🌲', rarity: 'legendary', type: 'garden_plant', description: 'A mythical tree of life' },
  { id: 'xp_50', name: 'XP Mega Boost', emoji: '🌟', rarity: 'legendary', type: 'xp_boost', description: '+50 bonus XP' },
  { id: 'phoenix_badge', name: 'Phoenix Badge', emoji: '🔥', rarity: 'legendary', type: 'badge', description: 'Rise from any challenge' },
];

const rollLoot = (): LootReward => {
  const roll = Math.random();
  let pool: LootReward[];
  if (roll < 0.05) pool = LOOT_POOL.filter(l => l.rarity === 'legendary');
  else if (roll < 0.25) pool = LOOT_POOL.filter(l => l.rarity === 'rare');
  else pool = LOOT_POOL.filter(l => l.rarity === 'common');
  return pool[Math.floor(Math.random() * pool.length)];
};

const rarityColors: Record<string, string> = {
  common: 'border-border/50 bg-muted/20',
  rare: 'border-primary/30 bg-primary/5',
  legendary: 'border-status-warning/40 bg-status-warning/5',
};

const rarityTextColors: Record<string, string> = {
  common: 'text-muted-foreground',
  rare: 'text-primary',
  legendary: 'text-status-warning',
};

interface LootBoxProps {
  trigger: 'quest_complete' | 'milestone';
  onRewardClaimed?: (reward: LootReward) => void;
}

export const useLootBox = () => {
  const { user } = useAuth();
  const storageKey = user ? `loot_inventory_${user.id}` : 'loot_inventory_guest';
  
  const getInventory = useCallback((): LootReward[] => {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  }, [storageKey]);

  const addToInventory = useCallback((reward: LootReward) => {
    const inventory = getInventory();
    inventory.push(reward);
    localStorage.setItem(storageKey, JSON.stringify(inventory));
  }, [storageKey, getInventory]);

  const canOpenBox = useCallback((): boolean => {
    const lastOpened = localStorage.getItem(`${storageKey}_last`);
    if (!lastOpened) return true;
    return new Date(lastOpened).toDateString() !== new Date().toDateString();
  }, [storageKey]);

  const markOpened = useCallback(() => {
    localStorage.setItem(`${storageKey}_last`, new Date().toISOString());
  }, [storageKey]);

  return { getInventory, addToInventory, canOpenBox, markOpened, rollLoot };
};

export const LootBoxModal = ({ open, onClose, onClaim }: { open: boolean; onClose: () => void; onClaim: (reward: LootReward) => void }) => {
  const [phase, setPhase] = useState<'unopened' | 'opening' | 'revealed'>('unopened');
  const [reward, setReward] = useState<LootReward | null>(null);

  useEffect(() => {
    if (open) {
      setPhase('unopened');
      setReward(null);
    }
  }, [open]);

  const handleOpen = () => {
    setPhase('opening');
    const loot = rollLoot();
    setTimeout(() => {
      setReward(loot);
      setPhase('revealed');
    }, 1500);
  };

  const handleClaim = () => {
    if (reward) onClaim(reward);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center border-primary/30">
        <AnimatePresence mode="wait">
          {phase === 'unopened' && (
            <motion.div key="unopened" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto mb-4"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto border-2 border-primary/30 shadow-lg">
                  <Gift className="w-12 h-12 text-primary" />
                </div>
              </motion.div>
              <h2 className="text-lg font-bold text-foreground mb-1">Mystery Loot Box!</h2>
              <p className="text-xs text-muted-foreground mb-4">You've earned a reward. Tap to open!</p>
              <Button onClick={handleOpen} className="rounded-full px-8 gap-2">
                <Sparkles className="w-4 h-4" /> Open Box
              </Button>
            </motion.div>
          )}

          {phase === 'opening' && (
            <motion.div key="opening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 15, -15, 0], scale: [1, 1.1, 0.95, 1.15, 1] }}
                transition={{ duration: 1.5 }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-status-warning/20 flex items-center justify-center mx-auto border-2 border-primary/40 shadow-lg mb-4"
              >
                <Gift className="w-12 h-12 text-primary animate-pulse" />
              </motion.div>
              <p className="text-sm text-muted-foreground animate-pulse">Opening...</p>
            </motion.div>
          )}

          {phase === 'revealed' && reward && (
            <motion.div key="revealed" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto border-2 shadow-lg mb-4 ${rarityColors[reward.rarity]}`}>
                <span className="text-5xl">{reward.emoji}</span>
              </div>
              <Badge variant="outline" className={`text-[10px] rounded-full capitalize mb-2 ${rarityTextColors[reward.rarity]}`}>
                {reward.rarity === 'legendary' && <Star className="w-2.5 h-2.5 mr-0.5" />}
                {reward.rarity}
              </Badge>
              <h2 className="text-lg font-bold text-foreground mb-1">{reward.name}</h2>
              <p className="text-xs text-muted-foreground mb-4">{reward.description}</p>
              <Button onClick={handleClaim} className="rounded-full px-8">Claim Reward</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
