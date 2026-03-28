import { SoulGarden } from "@/components/SoulGarden";
import { PageLayout } from "@/components/layout/PageLayout";

export const GardenPage = () => {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gradient-soul">
            Your Soul Garden
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            Watch your mindfulness journey bloom as you complete activities
          </p>
        </div>

        <SoulGarden />
      </div>
    </PageLayout>
  );
};