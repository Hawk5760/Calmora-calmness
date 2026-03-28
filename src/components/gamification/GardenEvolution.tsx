import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Lock, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CollectiblePlant {
  id: string;
  name: string;
  emoji: string;
  unlockCondition: string;
  unlockLevel: number;
  rarity: 'common' | 'rare' | 'legendary';
  unlocked: boolean;
}

export const GARDEN_PLANTS: Omit<CollectiblePlant, 'unlocked'>[] = [
  { id: 'seedling', name: 'First Seedling', emoji: '🌱', unlockCondition: 'Reach Level 1', unlockLevel: 1, rarity: 'common' },
  { id: 'daisy', name: 'Daisy', emoji: '🌼', unlockCondition: 'Reach Level 2', unlockLevel: 2, rarity: 'common' },
  { id: 'tulip', name: 'Tulip', emoji: '🌷', unlockCondition: 'Reach Level 3', unlockLevel: 3, rarity: 'common' },
  { id: 'sunflower', name: 'Sunflower', emoji: '🌻', unlockCondition: 'Reach Level 5', unlockLevel: 5, rarity: 'common' },
  { id: 'cherry_blossom', name: 'Cherry Blossom', emoji: '🌸', unlockCondition: 'Reach Level 7', unlockLevel: 7, rarity: 'rare' },
  { id: 'rose', name: 'Rose Garden', emoji: '🌹', unlockCondition: 'Reach Level 10', unlockLevel: 10, rarity: 'rare' },
  { id: 'bonsai', name: 'Ancient Bonsai', emoji: '🎋', unlockCondition: 'Reach Level 12', unlockLevel: 12, rarity: 'rare' },
  { id: 'orchid', name: 'Mystic Orchid', emoji: '🪻', unlockCondition: 'Reach Level 15', unlockLevel: 15, rarity: 'rare' },
  { id: 'bamboo', name: 'Bamboo Forest', emoji: '🎍', unlockCondition: 'Reach Level 18', unlockLevel: 18, rarity: 'legendary' },
  { id: 'world_tree', name: 'World Tree', emoji: '🌳', unlockCondition: 'Reach Level 20', unlockLevel: 20, rarity: 'legendary' },
  { id: 'golden_lotus', name: 'Golden Lotus', emoji: '🪷', unlockCondition: '21 good moods', unlockLevel: 99, rarity: 'legendary' },
  { id: 'cosmic_bloom', name: 'Cosmic Bloom', emoji: '💮', unlockCondition: 'Reach Sage rank', unlockLevel: 21, rarity: 'legendary' },
];

const rarityBorder: Record<string, string> = {
  common: 'border-border/40',
  rare: 'border-primary/30',
  legendary: 'border-status-warning/30',
};

const rarityBg: Record<string, string> = {
  common: 'bg-muted/10',
  rare: 'bg-primary/5',
  legendary: 'bg-status-warning/5',
};

interface GardenEvolutionProps {
  playerLevel: number;
  goodMoodCount: number;
  lootPlants?: string[];
}

export const GardenEvolution = ({ playerLevel, goodMoodCount, lootPlants = [] }: GardenEvolutionProps) => {
  const plants: CollectiblePlant[] = GARDEN_PLANTS.map(p => ({
    ...p,
    unlocked: p.id === 'golden_lotus' 
      ? goodMoodCount >= 21 
      : p.unlockLevel <= playerLevel || lootPlants.includes(p.id),
  }));

  const unlockedCount = plants.filter(p => p.unlocked).length;
  const nextPlant = plants.find(p => !p.unlocked);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Plant Collection</span>
        </div>
        <Badge variant="outline" className="text-[10px] rounded-full">
          {unlockedCount}/{plants.length}
        </Badge>
      </div>

      {nextPlant && (
        <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10 text-[10px] text-muted-foreground">
          Next unlock: <span className="font-medium text-foreground">{nextPlant.emoji} {nextPlant.name}</span> — {nextPlant.unlockCondition}
        </div>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {plants.map((plant, i) => (
          <motion.div
            key={plant.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              "relative flex flex-col items-center p-2 rounded-xl border transition-all",
              plant.unlocked ? rarityBg[plant.rarity] : 'bg-muted/5 opacity-50',
              plant.unlocked ? rarityBorder[plant.rarity] : 'border-border/20'
            )}
          >
            <span className={cn("text-2xl mb-1", !plant.unlocked && "grayscale blur-[2px]")}>
              {plant.emoji}
            </span>
            <span className="text-[8px] text-center text-muted-foreground leading-tight truncate w-full">
              {plant.name}
            </span>
            {plant.unlocked ? (
              <Check className="absolute top-1 right-1 w-2.5 h-2.5 text-status-success" />
            ) : (
              <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-muted-foreground/40" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
