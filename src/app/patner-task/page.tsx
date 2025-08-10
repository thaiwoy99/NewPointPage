'use client'

import Dex from "./components/dex"
import Stats from './components/stats'
import { useState } from "react"

interface tasks {
  task: string
  isActive: boolean
}


const page = () => {


  
const [Tasks,setTasks] = useState([
  {
    task: 'Patners tasks',
    isActive: true
  },
  {
    task: 'Social tasks',
    isActive: false
  }
])


const ChangeIsActive = (id:string):void=>{
  setTasks((prev :tasks[])=>{
   return  prev.map((item:tasks)=>(
      item.task ===id?{...item,isActive:true}:{...item,isActive:false}
    ))

  })};



  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat bg-[#0F0F0F] z-[-1]" />
      <div className="relative z-10 px-[20px] pt-[150px] pb-[20px]">
        <div className="flex items-center mb-4 space-x-4">
          {Tasks.map(({ task, isActive }, i) => (
            <button 
              key={i}
              className={`px-[20px] py-[10px] border-[0.3px] border-[#3FFF3DA3] ${
                isActive ? "bg-[#10200B] hover:bg-[#FEFEFE40]"  : "bg-[#FEFEFE40] hover:bg-[#10200B]"
              } rounded-[12px] cursor-pointer `}
              onClick={()=>{ChangeIsActive(task)}}
            >
              {task}
            </button>
          ))}
        </div>
        <div className="flex justify-between">
          <Dex />
          <Stats />
        </div>
      </div>
    </div>
  )
}

export default page