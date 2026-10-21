import CustomCursor from "@/components/effects/custom-cursor";
import { fontVariables } from "@/lib/fonts";

export default function RootBody({ children }: { children: React.ReactNode }) {
  return (
    <body className={`${fontVariables} min-h-dvh bg-void text-[#f0fff4] antialiased`}>
      <CustomCursor />
      {children}
    </body>
  );
}
