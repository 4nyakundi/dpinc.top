import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center ${className || ""}`}>
      <Image
        src="/logo.png"
        alt="DataPort.INC"
        width={184}
        height={40}
        className="h-10 w-auto object-contain dark:block hidden"
        priority
      />
      <Image
        src="/logo-light.png"
        alt="DataPort.INC"
        width={184}
        height={40}
        className="h-10 w-auto object-contain dark:hidden block"
        priority
      />
    </div>
  );
}
