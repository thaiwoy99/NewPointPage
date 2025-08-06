
import Image from "next/image"

const Tasks =()=>{
    return(
        <div className="border-[#FFFFFF]/30 bg-[#262626]/50 border p-4 rounded-2xl space-y-[40px]">
            <div className="space-y-[8px]">
                <p className="text-[#B1B1B1] text-base font-normal">Trade at least$50 worth of crypto</p>
                <p className="font-semibold text-2xl text-white">Complete a Trade</p>
            </div>
            <p className="text-[#3FFF3D] font-semibold text-[18px]">
                200 points
            </p>

        </div>

    )
}
const Stats = () => {
  return (
    <div>
        <div className="bg-[#171717]/50 border-[#ffffff]/30 border  p-6 w-[400px] min-h-[682px] rounded-2xl space-y-4 ">
        <div className="  flex  justify-between bg-[url('/images/statImage.png')] bg-[#002403] border rounded-2xl p-4 bg-cover bg-center bg-blend-multiply">

        <div className="space-y-3 ">
            <h2 className=" font-semibold text-2xl text-[#4FCD4D]">Your stats</h2>
            <p className="font-normal text-base text-[#FEFEFE]">
                <span className="text-[#B1B1B1]">Total points:</span>
                <span className="font-bold "> 1200</span>
                 </p>
                  <p className="font-normal text-base text-[#FEFEFE]">
                <span className="text-[#B1B1B1]">Rank:</span>
                <span className="font-bold "> #5</span>
                 </p>
            
     </div>
        <div className="  relative h-full  ]"> <Image
                            src="/images/Subtract.png"
                            alt="Plane"
                            width={100}
                            height={100}
                            className=" z-30 relative  left-[10px]"
                            priority
                          />

                          <Image
                            src="/images/Vectorstroke.png"
                            alt="Plane"
                            width={500}
                            height={100}
                            className=" absolute top-[-16px] z-[20]"
                            priority
                          />
             </div>

        </div>
        <Tasks/>
        <Tasks/>
        <Tasks/>
        
        

        </div>
    </div>
  )
}

export default Stats