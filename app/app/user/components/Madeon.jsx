import React from 'react'
import MainIcon from '../images/Home/mainicon.svg'
import HeroButton from '../images/Home/herobutton.svg'

function Madeon() {
  return (
    <div className='containerpaddin container mx-auto mt-[50px] xl:mt-[100px]  items-center justify-center'>

          <p className='font-Galldis font-light-500 text-white text-[10px] text-white  mt-4 text-center'>
            #MADEONBEATSTARS
          </p>
          
          <h1 className='text-white font-Title text-[20px] md:text-[25px] lg:text-[30px] xl:text-[40px] 2xl:text-[50px] text-center mt-4'>
            Create Song With <br></br>
            The Power of AI
          </h1>

          <p className='font-Galldis font-light-500 text-white text-[10px] text-white  mt-4 text-center'>
            The largest marketplace for high quality beatsAccess over 8 <br/>million beats from our growing community of producers<br/> around the world.
          </p>

          <div className='flex items-center justify-center gap-4 mt-10'>
          <div className="flex items-center  gap-2 md:gap-4">
            <img src={MainIcon.src} alt="" className="h-10 md:h-15 lg:h-13 xl:h-15  w-auto " />
            <img src={HeroButton.src} alt="" className="h-10 md:h-15 lg:h-13 xl:h-15 w-auto" />
            </div>
          </div>
    </div>
  )
}

export default Madeon

