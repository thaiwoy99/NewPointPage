import React from 'react'
import { Zap } from 'lucide-react';
import { TaskDetails } from './Tasks';

const TasksComp = ({title,isCompleted}:TaskDetails) => {
  return (
    <div className={` ${isCompleted ?'bg-[#A1FEA040]' :'bg-[#404040]'} backdrop-blur-sm p-6 rounded-[12px] flex justify-between items-center`}>
        <div className='flex space-x-1 items-center'>
        <Zap  className="text-[#FFA500] fill-[#FFA500]  size-5"/>
        <p className={` ${isCompleted ?'text-[#3FFF3D]' :'text-white text-base font-medium'} `} >{title}</p>
        </div>
        <div className=' flex space-x-1 items-center'>
        <p className={` ${isCompleted ?'text-[#3FFF3D]' :'text-white text-base font-medium'} `}>+5.00</p> 
        <Zap className="text-[#FFA500] fill-[#FFA500]  size-5"/>
        </div>

    </div>
  )
}

export default TasksComp