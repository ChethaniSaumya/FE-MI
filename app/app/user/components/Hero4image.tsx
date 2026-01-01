import React from 'react'
import Hero1 from '../images/Home/hero1.png'
import Hero2 from '../images/Home/hero2.png'
import Hero3 from '../images/Home/hero3.png'
import Hero4 from '../images/Home/hero4.png'
import MainIcon from '../images/Home/mainicon.svg'
import Whiteline from '../images/Home/whitebgline.svg'
import Banner from '../components/Banner'

function Hero4image() {
  return (
    <div className="relative">

      <div className='relative'>
        <div className='containerpaddin container mx-auto'>
          <div className="">




            <div className=" top-0 left-0 w-full h-full">
              <div className="md:flex md:items-center md:justify-between gap-2 xl:gap-4 md:px-4">

                <div className="hidden md:block">
                  <img src={Hero1.src} alt="" className="hover:scale-105 transition-all duration-700 ease-out cursor-pointer" />
                </div>


                <div className="hidden md:block md:mt-[100px] xl:mt-[300px]">
                  <img src={Hero2.src} alt="" className="hover:scale-105 transition-all duration-700 ease-out cursor-pointer" />
                </div>


                <div className="hidden md:block">
                  <img src={Hero3.src} alt="" className="hover:scale-105 transition-all duration-700 ease-out cursor-pointer" />
                </div>

                {/* MainIcon + text + Hero4 */}
                <div className="mt-[50px] xl:mt-[50px] xl:mt-[250px] ">
                  <div className="flex flex-col gap-10">
                    <div className="flex flex-col  items-end gap-0">
                      <img src={MainIcon.src} alt="" className="h-15 md:h-10 xl:h-15 w-auto hover:scale-110 hover:rotate-6 transition-all duration-700 ease-out cursor-pointer" />
                      <p className="font-Galldis font-light-500 text-white text-[13px] md:text-[9px] xl:text-[13px] text-white  mt-4 xl:leading-5 text-right">
                        <span className="font-bold">Your next track</span><br />

                        is just a click away.<br />
                         Experience the future of music with AI. <br />
                         Start your free trial today.
                        
                      </p>
                    </div>
                    <img src={Hero4.src} alt="" className="w-full md:w-auto hover:scale-110 hover:rotate-2 transition-all duration-700 ease-out cursor-pointer" />
                  </div>

                </div>
              </div>
            </div>
          </div>
          <h1 className='text-white font-Title text-[20px] md:text-[30px] xl:text-[50px] font-roboto font-bold mt-10'>
          Turn Ideas Into Hits  <br></br>
          with AI Music Creation.
          </h1>
          <p className='font-Galldis font-light-500 text-white text-sm text-white  mt-4'>

          From trap beats to lo-fi vibes, generate high-quality music using our AI-powered song maker.<br /> Perfect for artists, creators, and dreamers.
            
          </p>
        </div>

      </div>

    </div>
  )
}

export default Hero4image