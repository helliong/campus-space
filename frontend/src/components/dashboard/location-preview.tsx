import Image from "next/image";

export function LocationPreview() {
  return (
    <div className="relative h-[223px] w-full overflow-hidden rounded-2xl bg-[#E8F8F5] sm:w-[250px] sm:shrink-0">
      <span className="absolute left-[10%] top-[13%] h-[28%] w-[35%] rounded-[10px] bg-white" />
      <span className="absolute right-[11%] top-[13%] h-[28%] w-[37%] rounded-[10px] bg-[#EEF0FF]" />
      <span className="absolute left-[10%] top-[47%] h-[18%] w-[79%] rounded-[10px] bg-white" />
      <span className="absolute bottom-[15%] left-[10%] h-[13%] w-[37%] rounded-lg bg-white" />
      <span className="absolute bottom-[15%] right-[11%] h-[13%] w-[37%] rounded-lg bg-[#FEF3D8]" />
      <Image alt="Метка выбранного места" className="absolute left-[60%] top-[53%]" height={18} src="/icons/dashboard-map-marker.svg" width={18} />
      <strong className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-brand">К-214</strong>
    </div>
  );
}
