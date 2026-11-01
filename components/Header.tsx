'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
const links=[['Home','/'],['Our Story','/our-story'],['Our Work','/our-work'],['Impact','/impact'],['Stories','/stories'],['Gallery','/gallery'],['Contact','/contact']];
export default function Header(){const [open,setOpen]=useState(false);return <><div className="topline">Together, we can build a brighter future <span>✦</span> Every action creates hope</div><header className="header"><div className="navwrap"><Link href="/" className="brand"><img className="brandmark-logo" src="/images/logo-mark.png" alt="Sahajshakti Sarvakalyaan Trust logo" width={42} height={50}/><span><b>Sahajshakti</b><small>SARVAKALYAAN TRUST</small></span></Link><button className="mobile-toggle" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X/>:<Menu/>}</button><nav className={open?'nav open':'nav'}>{links.map(([name,url])=><Link key={url} href={url} onClick={()=>setOpen(false)}>{name}</Link>)}<Link className="nav-donate" href="/donate" onClick={()=>setOpen(false)}>Donate <span>↗</span></Link></nav></div></header></>}
