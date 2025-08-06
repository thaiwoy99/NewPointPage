

import {PointTypeDetails} from './components/Pointstype'
import { PointTypes } from "./components/Pointstype";
import { Divide } from "lucide-react";
import Earnings from "./components/Earnings";
import {TaskDetails,tasks} from './components/Tasks'
import TasksComp from './components/TasksComp'
import { LeaderboardpointTypes,users,User } from "./components/LeaderboarderPoint";
import { Zap } from 'lucide-react';
import SelectedThree from "./components/SelectedThree";
import { FaTwitter, FaDiscord, FaTelegram, FaGithub } from 'react-icons/fa';
import { BarChart3, FileText, ScrollText,ExternalLink } from 'lucide-react';
import Link from "next/link";




const navItems = [
  {
    text: "Risk dashboard",
    icon: BarChart3,
    link: "#"
  },
  {
    text: "Docs",
    icon: FileText, 
    link: "#"
  },
  {
    text: "Terms",
    icon: ScrollText,
    link: "#"
  }
]



export default function NewPoint() {
  

  return (
    <main className="min-h-screen relative ">
        <div className="absolute inset-0 bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat bg-[#0F0F0F] z-[-1]" />

        
        <div className="px-[40px] relative z-10  pt-[100px]  pb-[30px]">
            <div className="space-y-3 ">
            <div className=" border border-[#ffffff]/30 bg-[#262626]/50 rounded-2xl p-6 ">
               <p className="text-xl font-medium text-white  text-left pb-3 border-b border-[#ffff]/8">My Earnings </p>
        {/* My Earnings*/}

            <div className=" w-full flex justify-between mt-2">
                {
                 PointTypes.map((point:PointTypeDetails,i:number)=>(
                    <div key ={i}><Earnings {...point}/></div>

                 ))   
                }

            </div>
            </div>
 
        {/* My Tasks*/}
         <div className=" border border-[#ffffff]/30 bg-[#262626]/40 rounded-2xl p-6 ">
         <p className="text-xl font-medium text-white  text-left pb-3 border-b border-[#ffff]/8 mb-2">Tasks </p>
            <div className=" flex flex-col space-y-3">
            {
                 tasks.map((task:TaskDetails,i:number)=>(
                    <div key ={i}><TasksComp {...task}/></div>

                 ))   
                }
                </div>


         </div>
                 {/* Leaderboard*/}
                 <div className="border-[#FFFFFF4D] border bg-[#262626]/40 p-6 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center border-b border-[#ffff]/8 pb-3">
                        <p className="text-xl font-medium">Leaderboard</p>
                            <select className="text-base font-normal border-[0.5px] p-3 w-[240px] rounded-[8px] border-[#A1A1AA]">
                    <option value="season1">Season 1</option>
                          </select>

                    </div>

                 <div className="flex  justify-between font-medium border-b border-[#ffff]/8 py-3 ">
                    <div className="flex text-base  text-[#A1FEA0] w-[15%]   justify-between">
                        <p>Rank</p> <p> UserName</p>
                    </div>
                    <div className="flex w-[80%]  justify-between  ">
                    {LeaderboardpointTypes.map((pointtype)=>(
                        <div className="flex  space-x-2  min-w-[160px]">
                            <Zap  className="text-[#FFA500] fill-[#FFA500]  size-5"/>
                            <p className=" text-base text-[#A1FEA0]">{pointtype}</p>

                        </div>
                        

                    ))}
                    </div>

                 </div>
                 {/*UserPOint*/}
                 <div className="space-y-3  ">

                 {users.map(({name,referralPoints,swapPoints,bridgePoints,limitOrderPoints,partnershipPoints},i)=>{
    const points = [referralPoints,swapPoints,bridgePoints,limitOrderPoints,partnershipPoints];
    return (
        <div key= {i} className="flex justify-between border-b border-[#ffff]/8 py-3">
            <div className="flex w-[15%] justify-between text-center font-medium text-base">
                <p className="">{i+1}.</p>
                <p className="">{name}</p>
            </div>
            <div className="flex w-[80%] justify-between">
                {points.map((point, index) => (
                    <div key={index} className="    min-w-[160px] flex justify-center">
                    <div key={index} className="border-[#ffffff]/50 rounded-3xl bg-[#404040] p-2 flex items-center w-[80px] justify-center space-x-2">
                    <Zap  className="text-[#FFA500] fill-[#FFA500]  size-3"/>
                        <p className="text-[12px] font-medium">{point}</p>
                    
                    </div>
                    </div>
                ))}
            </div>
        </div>
    )
})}

                 </div>
                 
                 </div>



            </div>

            <div className="mb-[100px]">
                <p className="text-[40px] font-extrabold text-center text-[#A1FEA0] my-[30px]"> Top 3 Users</p>
                  <SelectedThree/>
            </div>


             <div className="flex justify-between mb-[50px]">

            <div className="flex items-center space-x-3">
 <div className="w-6 h-6 bg-[#A1FEA0] rounded-full flex justify-center items-center text-black cursor-pointer transform transition-transform duration-300 hover:scale-125"><FaTwitter  /></div>
   <div className="w-6 h-6 bg-[#A1FEA0] rounded-full flex justify-center items-center text-black cursor-pointer transform transition-transform duration-300 hover:scale-125"><FaDiscord /></div>
  <div className="w-6 h-6 bg-[#A1FEA0] rounded-full flex justify-center items-center text-black cursor-pointer transform transition-transform duration-300 hover:scale-125"><FaTelegram /></div>
  <div className="w-6 h-6 bg-[#A1FEA0] rounded-full flex justify-center items-center text-black cursor-pointer transform transition-transform duration-300 hover:scale-125"><FaGithub /></div>
  
</div>
<div className="flex items-center space-x-5">{navItems.map((item, index) => {
  const IconComponent = item.icon;
  return (
    <Link 
  key={index}
  href={item.link}
  
>
    <div className="flex space-x-2 items-center ">
  <IconComponent className="text-[#A1FEA0] size-4 transition-transform duration-300 hover:scale-110 hover:text-green-400" />
  <p className="text-base font-medium text-[#A1FEA0] underline transition-colors duration-300 hover:text-green-400">
    {item.text}
  </p>
  <ExternalLink className="text-[#A1FEA0] size-4 transition-transform duration-300 hover:scale-110 hover:text-green-400" />
  </div>
</Link>
  );
})}
</div>


</div>

          

        </div>

    </main>
  );
}
