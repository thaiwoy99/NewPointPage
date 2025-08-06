
import { PointTypeDetails } from "./Pointstype"
import Link from "next/link"
import { Zap,ArrowRight , } from 'lucide-react';



const Earnings = (  {title,points,icon:Icon,buttonText,buttonLink,buttonicon:ButtonIcon 
}:PointTypeDetails) => {
  return (
    <div className='border border-[#A1FEA0]/30  rounded-2xl p-3 flex flex-col space-y-3'
    
    
    style={{
    background: `
      linear-gradient(135deg, rgba(161, 254, 160, 0.08) 0%, rgba(161, 254, 160, 0.04) 100%),
      linear-gradient(45deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.10) 100%),
      #0f1419
    `
  }}>
        <p className='text-xl font-bold text-[#A1FEA0] text-center'>{title}</p>
        <div className=" flex justify-center space-x-2 items-center">
            <Icon className="text-[#FFA500] fill-[#FFA500]  size-5" />
            <span className="font-extrabold text-white text-[22.5px]">{points}</span>
          </div>

    <Link href={buttonLink}>
  <div
    className=' mt-4 inline-flex items-center justify-between gap-2 px-4 py-3 rounded-[12px] text-[12px] font-semibold text-[#86EFAC] border-[0.67px] border-[#86EFAC] w-full  cursor-pointer transform transition-transform duration-300 hover:scale-105'
  >
    {buttonText}
    <ButtonIcon className="w-[12px] h-[10px]" />
  </div>

    </Link>


    

    </div>
  )
}

export default Earnings


