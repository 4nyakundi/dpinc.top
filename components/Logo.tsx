import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <Image
        src="/logo.svg"
        alt="DataPort Logo"
        width={48}
        height={48}
        className="h-12 w-12"
      />
      <div className="leading-tight">
        <span className="block text-lg font-bold tracking-tight text-white">
          Data<span className="text-lime-400">Port</span>
        </span>
        <span className="block text-xs uppercase tracking-[0.3em] text-slate-300">
          INC
        </span>
      </div>
    </div>
  );
}
