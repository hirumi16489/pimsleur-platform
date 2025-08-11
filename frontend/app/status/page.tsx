import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function Status() {
  const isLoading = false;
  const hasItems = false;

  return (
    <div className="pt-20 pb-12">
      <Container>
        <Card className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Status</h1>
          <p className="text-sm text-zinc-600 mb-6">Recent uploads and processing states.</p>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : hasItems ? (
            <ul className="space-y-2">{/* map items here */}</ul>
          ) : (
            <EmptyState
              title="No recent uploads"
              description="Upload files to see processing progress here."
            />
          )}
        </Card>
      </Container>
    </div>
  );
}
