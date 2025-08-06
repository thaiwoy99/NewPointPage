
import Image from "next/image"

// Define the User interface
interface User {
  name: string;
  points: string;
  position: string;
}

// Create the users array
const winners: User[] = [
  { 

    name: "Alice",
    points:' 1,4533,43' ,
    position: "1st place"
  },
  {
    name: "Bob",
    points: '1,4533,42',
    position: "2nd place"
  },
  {
    name: "Charlie",
    points: '1,4533,41',
    position: "3rd place"
  }
];



const SelectedThree = () => {
  return (
    <div className=" flex space-x-6 justify-center">
        {winners.map(({name,points,position},i:number)=>(
            
    <div key={i} className = {` w-[200px]  relative ${position.includes('1st')?'order-1 ':  position.includes('2nd')?'mt-[30px]':'order-2 mt-[70px]'}`}>

        <div className ={`w-full h-[250px] ${position.includes('1st')?'bg-[#D78B00] ': ' bg-[#187717]'} rounded-[11px]` }> 
        </div>
        <div className=" bg-white w-[200px] h-[250px] rounded-[11px] absolute top-[-5px] right-[10px] py-3.5">
          <div className="text-[#162B24] text-center">
           <p className="font-light text-[12.96px] italic space-y-2 ">{name}</p>
           <p className="font-bold text-[22.2px]">{points}</p>
           <p className=" font-bold text-[]">{position}</p>
           </div>
        </div>
          {position.includes('1st') ? (
  
           <div className=" absolute translate-x-1/2 right-[50%] bottom-[-10px]   z-50  w-full">
           <Image
                src="/images/Plane1.png"
                alt="Plane"
                width={2500}
                height={1000}
                className=""
                priority
              />
              </div>
) : (
    
           <div className=" absolute translate-x-1/2 right-[60%] bottom-[-20px]   z-50 ">
           <Image
                src="/images/Plane2.png"
                alt="Plane"
                width={1700}
                height={600}
                className=""
                priority
              />
              </div>
  
)}

              </div>
            
        ))}

        
    </div>
  )
}

export default SelectedThree