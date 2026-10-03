import { PageCurtain } from "@/components/shell/page-curtain";

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageCurtain>{children}</PageCurtain>;
}
