import React from 'react'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#251721]">
      {children}
    </div>
  )
} 