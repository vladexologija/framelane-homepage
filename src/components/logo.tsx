import Image from "next/image";

export function Logo({ width = 140 }: { width?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="FrameLane"
      width={1381}
      height={244}
      style={{ width, height: "auto" }}
      priority
    />
  );
}
