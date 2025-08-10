

'use client'
import Image from 'next/image';
import { useState } from 'react';

interface buttonItem {
  name: string;
  isActive: boolean;
}






interface NameObject {
  firstname: string;
  secondname: string;
  thirdname: string;
  isActive: boolean;
}


const namesArray: NameObject[] = [
  { 
    firstname: "Orca",
    secondname: "Defi",
    thirdname: "Dex",
    isActive: true
  },
  { 
    firstname: "Orca",
    secondname: "Defi",
    thirdname: "Dex",
    isActive: false
  },
  { 
    firstname: "Orca",
    secondname: "Defi",
    thirdname: "Dex",
    isActive: false
  },
  { 
    firstname: "Orca",
    secondname: "Defi",
    thirdname: "Dex",
    isActive: false
  },
  { 
    firstname: "Orca",
    secondname: "Defi",
    thirdname: "Dex",
    isActive: false
  },
  { 
    firstname: "Orca",
    secondname: "Defi",
    thirdname: "Dex",
    isActive: false
  }
];

import React from 'react'

const Dex = () => {

const [buttonItems,setButtonItems] = useState<buttonItem[] >([
  {
    name: "All",
    isActive: true

  },
  {
    name: "Games",
    isActive: false
  },
  {
    name: "Defi",
    isActive: false
  },
  {
    name: "Bridges",
    isActive: false
  },
  {
    name: "Infra",
    isActive: false
  },
  {
    name: "Consumer",
    isActive: false
  }
]);

const ChangeIsActive = (id:string):void=>{
  setButtonItems((prev :buttonItem[])=>{
   return  prev.map((item:buttonItem)=>(
      item.name ===id?{...item,isActive:true}:{...item,isActive:false}
    ))

  })
}



  return (
    <div className='bg-[#262626]/50 border-[#ffffff]/30 rounded-2xl border p-6 w-[800px] 
      space-y-4  '> 
     <div className="flex gap-2">
      {buttonItems.map((item, index) => (
        <button
          key={index}
          className={`
            px-3 py-1.5 rounded-3xl border  border-[#FEFEFE] text-white font-light 
            ${item.isActive ? 'bg-[#3FFF3D33] border-none' : ''} cursor-pointer hover:scale-105
          `}
          onClick={()=>{ChangeIsActive(item.name)}}
        >
          {item.name}
        </button>
      ))}
    </div>
 
        <div className='flex flex-wrap gap-4 justify-center  text-[#FEFEFE] font-normal text-base '>
     {namesArray.map(({firstname,secondname,thirdname,isActive})=>(
    
<div 
  className="w-[31%] flex flex-col rounded-[6.32px] border-[0.79px] p-3 h-[305px]"
  style={{
    background: isActive 
      ? 'linear-gradient(180deg, #020302 0%, #0E1D18 83.95%)'
      : 'rgba(0, 0, 0, 0.32)'
  }}
>
        <div className=' flex justify-between'>
            <p className=''>{firstname}</p>
            <p className='bg-[#1F4B0887] px-[10px] py-[5px] rounded-[19px] inline-block'>{secondname}</p>
        </div>
          
             <div className='w-[90px] m-auto'> 
        
                  <Image
                          src="/images/patnerimage.png"
                          alt="Plane"
                          width={87}
                          height={84}
                          className=""
                          priority
                        />

        </div>

        <div className='flex justify-end mt-auto  '>

        <p className='bg-[#1F4B0887] px-[10px] py-[5px] rounded-[19px] inline-block'>{thirdname}</p>
            </div>
        </div>
     ))}
    </div>
    </div>
  )
}

export default Dex
