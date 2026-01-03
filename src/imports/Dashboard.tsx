import svgPaths from "./dashboard-icon-paths";
import imgFrame5518 from "figma:asset/99025026ef545fce7a758188585b742e3d5aba25.png";
import imgDisplayPicture from "figma:asset/317de567bfebba8852c55c6d88733f6b810c30d5.png";

function Logogram() {
  return (
    <div className="h-[24.073px] relative shrink-0 w-[28px]" data-name="Logogram">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 25">
        <g id="Logogram">
          <path d={svgPaths.p29fe8900} fill="var(--fill-0, black)" id="Polygon 13" />
          <path d={svgPaths.p243e4980} fill="var(--fill-0, black)" id="Polygon 14" />
        </g>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-center left-[23px] top-[7px]" data-name="Logo">
      <Logogram />
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.4] not-italic relative shrink-0 text-[20px] text-black text-nowrap whitespace-pre">Venture</p>
    </div>
  );
}

function Container() {
  return (
    <div className="basis-0 grow h-[40px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[40px] relative w-full">
        <Logo />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[40px] relative shrink-0 w-[151px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[32px] h-[40px] items-center relative w-[151px]">
        <Container />
      </div>
    </div>
  );
}

function IconGear() {
  return (
    <div className="absolute bottom-[-6.25%] left-0 right-0 top-[6.25%]" data-name="Icon/Gear">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon/Gear">
          <g id="Vector"></g>
          <path d={svgPaths.p3831b780} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p3a1c7780} id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border overflow-clip relative rounded-[inherit] size-[16px]">
        <IconGear />
      </div>
    </div>
  );
}

function Navigation() {
  return (
    <div className="h-[20px] relative shrink-0 w-[61.672px]" data-name="Navigation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-[61.672px]">
        <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-black text-nowrap whitespace-pre">Settings</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute box-border content-stretch flex gap-[16px] h-[40px] items-center justify-center left-[802.5px] p-[0.5px] rounded-[8px] top-[12px] w-[132px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
      <Icon />
      <Navigation />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p32887f80} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1a837050} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1f197700} id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3694d280} id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Navigation1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[68.969px]" data-name="Navigation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-[68.969px]">
        <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-black text-nowrap whitespace-pre">Profile</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute box-border content-stretch flex gap-[16px] h-[40px] items-center justify-center left-[658.5px] p-[0.5px] rounded-[8px] top-[13px] w-[132px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
      <Icon1 />
      <Navigation1 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4001_10438)" id="Icon">
          <path d={svgPaths.pe43ac80} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_4001_10438">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Navigation2() {
  return (
    <div className="h-[20px] relative shrink-0 w-[61.672px]" data-name="Navigation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-[61.672px]">
        <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-black text-nowrap whitespace-pre">Messages</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute box-border content-stretch flex gap-[16px] h-[40px] items-center justify-center left-[514.5px] p-[0.5px] rounded-[8px] top-[12px] w-[132px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
      <Icon2 />
      <Navigation2 />
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-black text-nowrap whitespace-pre">0</p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M5.33333 1.33333V4" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M10.6667 1.33333V4" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3ee34580} id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2 6.66667H14" id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Navigation3() {
  return (
    <div className="h-[20px] relative shrink-0 w-[90.625px]" data-name="Navigation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-[90.625px]">
        <p className="basis-0 font-['Arimo:Regular',_sans-serif] font-normal grow leading-[20px] min-h-px min-w-px relative shrink-0 text-[14px] text-black">Appointments</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute box-border content-stretch flex gap-[16px] h-[40px] items-center justify-center left-[370.5px] p-[0.5px] rounded-[8px] top-[12px] w-[132px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
      <Icon3 />
      <Navigation3 />
    </div>
  );
}

function IconChartPie() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon/ChartPie">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon/ChartPie">
          <g id="Vector"></g>
          <path d={svgPaths.p30c3b00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M10 10V2.5" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M16.4952 6.25L3.50481 13.75" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Navigation4() {
  return (
    <div className="h-[20px] relative shrink-0 w-[68.969px]" data-name="Navigation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-[68.969px]">
        <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">Dashboard</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-neutral-950 box-border content-stretch flex gap-[16px] h-[40px] items-center justify-center left-[226.5px] p-[0.5px] rounded-[8px] top-[11px] w-[132px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
      <IconChartPie />
      <Navigation4 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[226.5px] top-[11px]">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[10px] size-[16px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p388cb800} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p5baad20} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute bg-[#d4183d] left-[20px] rounded-[8px] size-[20px] top-[-4px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] items-center justify-center overflow-clip p-px relative rounded-[inherit] size-[20px]">
        <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[16px] relative shrink-0 text-[12px] text-nowrap text-white whitespace-pre">3</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute h-[32px] left-[1047.5px] rounded-[8px] top-[20px] w-[36px]" data-name="Button">
      <Icon4 />
      <Badge />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[64px] relative shrink-0 w-[1007px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[64px] relative w-[1007px]">
        <Group1 />
        <Button5 />
      </div>
    </div>
  );
}

function Frame5518() {
  return (
    <div className="relative rounded-[24px] shrink-0 size-[32px]">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[24px] size-full" src={imgFrame5518} />
    </div>
  );
}

function IconCaretDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon/CaretDown">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon/CaretDown">
          <g id="Vector"></g>
          <path d="M13 6L8 11L3 6" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Profile() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[124px]" data-name="Profile">
      <Frame5518 />
      <p className="capitalize font-['Arimo:Regular',_sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-neutral-950 text-nowrap whitespace-pre">Brian F.</p>
      <IconCaretDown />
    </div>
  );
}

function IconQuestion() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon/Question">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon/Question">
          <g id="Vector"></g>
          <path d={svgPaths.p30c3b00} id="Vector_2" stroke="var(--stroke-0, #727272)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p1e260480} fill="var(--fill-0, #727272)" id="Vector_3" stroke="var(--stroke-0, #727272)" strokeWidth="1.5" />
          <path d={svgPaths.pd3b280} id="Vector_4" stroke="var(--stroke-0, #727272)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[200px]" data-name="Content">
      <IconQuestion />
    </div>
  );
}

function NavigationSidebarMenu() {
  return (
    <div className="box-border content-stretch flex gap-[12px] h-full items-center p-[8px] relative rounded-[4px] shrink-0 w-[33px]" data-name="Navigation / Sidebar / Menu">
      <Content />
    </div>
  );
}

function Frame47667() {
  return (
    <div className="relative shrink-0 w-[189px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[32px] items-center relative w-[189px]">
        <Profile />
        <div className="flex flex-row items-center self-stretch">
          <NavigationSidebarMenu />
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-[#f9f9f9] content-stretch flex h-[64px] items-center justify-between left-0 top-0 w-[1563px]" data-name="Container">
      <Container1 />
      <Container2 />
      <Frame47667 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[28px] relative shrink-0 w-[64.938px]" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-[64.938px]">
        <p className="absolute font-['Arimo:Bold',_sans-serif] font-bold leading-[28px] left-0 text-[18px] text-neutral-950 text-nowrap top-[-1px] whitespace-pre">Clients</p>
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-neutral-950 h-[33px] relative rounded-[8px] shrink-0 w-[125.594px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.5px]" />
      <div className="bg-clip-padding border-[0.5px] border-[transparent] border-solid box-border content-stretch flex gap-[16px] h-[33px] items-center justify-center p-[0.5px] relative w-[125.594px]">
        <Icon5 />
        <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">Add Client</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex h-[32px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading2 />
      <Button6 />
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute bg-[#ececf0] box-border content-stretch flex h-[36px] items-center left-0 overflow-clip pl-[40px] pr-[16px] py-[8px] rounded-[10px] top-0 w-[361px]" data-name="Text Input">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-[rgba(10,10,10,0.5)] text-nowrap whitespace-pre">Search clients...</p>
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M14 14L11.1067 11.1067" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p107a080} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[36px] relative shrink-0 w-[361px]" data-name="Container">
      <TextInput />
      <Icon6 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p12824f00} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function PrimitiveSpan() {
  return (
    <div className="h-[20px] relative shrink-0 w-[68.203px]" data-name="Primitive.span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[20px] items-center overflow-clip relative rounded-[inherit] w-[68.203px]">
        <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-neutral-950 text-nowrap whitespace-pre">All Clients</p>
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon" opacity="0.5">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function PrimitiveButton() {
  return (
    <div className="bg-[#f3f3f5] h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[36px] items-center justify-between pl-[13px] pr-[13.016px] py-px relative w-full">
          <Icon7 />
          <PrimitiveSpan />
          <Icon8 />
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[36px] items-start relative shrink-0 w-full" data-name="Container">
      <PrimitiveButton />
    </div>
  );
}

function ClientSearch() {
  return (
    <div className="h-[161px] relative shrink-0 w-[392.656px]" data-name="ClientSearch">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[16px] h-[161px] items-start pb-px pt-[16px] px-[16px] relative w-[392.656px]">
        <Container4 />
        <Container5 />
        <Container6 />
      </div>
    </div>
  );
}

function Content1() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px relative shrink-0" data-name="Content">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">Robert Fox</p>
    </div>
  );
}

function Content2() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-center left-0 top-0 w-[144px]" data-name="Content">
      <Content1 />
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[44px] relative shrink-0 w-full" data-name="Container">
      <Content2 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute bottom-[22.73%] content-stretch flex flex-col items-start right-0 top-[22.73%] w-[131px]" data-name="Container">
      <Container7 />
    </div>
  );
}

function DisplayPicture() {
  return (
    <div className="absolute left-[18px] rounded-[24px] size-[40px] top-0" data-name="Display Picture">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[24px] size-full" src={imgDisplayPicture} />
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[44px] relative shrink-0 w-[203px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[44px] relative w-[203px]">
        <Container8 />
        <DisplayPicture />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[46px] relative shrink-0 w-[83px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[46px] relative w-[83px]">
        <p className="absolute font-['Arimo:Regular',_sans-serif] font-normal h-[40px] leading-[20px] left-[44.5px] text-[14px] text-white top-[calc(50%-23px)] w-[76px]">Last visit: 2024-09-28</p>
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p36e45a00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p150f5b00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2d6e5280} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="h-[32px] relative rounded-[8px] shrink-0 w-[36px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[32px] items-center justify-center relative w-[36px]">
        <div className="flex h-[calc(1px*((var(--transform-inner-width)*1)+(var(--transform-inner-height)*0)))] items-center justify-center relative shrink-0 w-[calc(1px*((var(--transform-inner-height)*1)+(var(--transform-inner-width)*0)))]" style={{ "--transform-inner-width": "16", "--transform-inner-height": "16" } as React.CSSProperties}>
          <div className="flex-none rotate-[90deg]">
            <Icon9 />
          </div>
        </div>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[46px] relative w-[37px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[46px] items-center relative w-[37px]">
        <Button7 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="bg-neutral-950 content-stretch flex h-[68px] items-center justify-between relative shrink-0 w-[393px]" data-name="Container">
      <Container9 />
      <Container10 />
      <div className="flex h-[calc(1px*((var(--transform-inner-width)*1)+(var(--transform-inner-height)*0)))] items-center justify-center relative shrink-0 w-[calc(1px*((var(--transform-inner-height)*1)+(var(--transform-inner-width)*0)))]" style={{ "--transform-inner-width": "37", "--transform-inner-height": "46" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <Container11 />
        </div>
      </div>
    </div>
  );
}

function Content3() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px relative shrink-0" data-name="Content">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[20px] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-black text-nowrap whitespace-pre">Robert Fox</p>
    </div>
  );
}

function Content4() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-center left-0 top-0 w-[144px]" data-name="Content">
      <Content3 />
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[44px] relative shrink-0 w-full" data-name="Container">
      <Content4 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute bottom-[22.73%] content-stretch flex flex-col items-start right-0 top-[22.73%] w-[131px]" data-name="Container">
      <Container13 />
    </div>
  );
}

function DisplayPicture1() {
  return (
    <div className="absolute left-[18px] rounded-[24px] size-[40px] top-0" data-name="Display Picture">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[24px] size-full" src={imgDisplayPicture} />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[44px] relative shrink-0 w-[203px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[44px] relative w-[203px]">
        <Container14 />
        <DisplayPicture1 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[46px] relative shrink-0 w-[83px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[46px] relative w-[83px]">
        <p className="absolute font-['Arimo:Regular',_sans-serif] font-normal h-[40px] leading-[20px] left-[44.5px] text-[#6a7282] text-[14px] top-[calc(50%-23px)] w-[76px]">Last visit: 2024-09-28</p>
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p36e45a00} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p150f5b00} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2d6e5280} id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="h-[32px] relative rounded-[8px] shrink-0 w-[36px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[32px] items-center justify-center relative w-[36px]">
        <div className="flex h-[calc(1px*((var(--transform-inner-width)*1)+(var(--transform-inner-height)*0)))] items-center justify-center relative shrink-0 w-[calc(1px*((var(--transform-inner-height)*1)+(var(--transform-inner-width)*0)))]" style={{ "--transform-inner-width": "16", "--transform-inner-height": "16" } as React.CSSProperties}>
          <div className="flex-none rotate-[90deg]">
            <Icon10 />
          </div>
        </div>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[46px] relative w-[37px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[46px] items-center relative w-[37px]">
        <Button8 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex h-[68px] items-center justify-between relative shrink-0 w-[393px]" data-name="Container">
      <Container15 />
      <Container16 />
      <div className="flex h-[calc(1px*((var(--transform-inner-width)*1)+(var(--transform-inner-height)*0)))] items-center justify-center relative shrink-0 w-[calc(1px*((var(--transform-inner-height)*1)+(var(--transform-inner-width)*0)))]" style={{ "--transform-inner-width": "37", "--transform-inner-height": "46" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <Container17 />
        </div>
      </div>
    </div>
  );
}

function ClientList() {
  return (
    <div className="h-[759px] relative shrink-0 w-[393px]" data-name="ClientList">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[759px] items-start overflow-clip relative rounded-[inherit] w-[393px]">
        <Container12 />
        {[...Array(4).keys()].map((_, i) => (
          <Container18 key={i} />
        ))}
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="bg-white h-[688px] relative rounded-[14px] shrink-0 w-[385px]" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[24px] h-[688px] items-start p-px relative w-[385px]">
        <ClientSearch />
        <ClientList />
      </div>
    </div>
  );
}

function Frame482751() {
  return (
    <div className="absolute bg-white h-[689px] left-[9px] rounded-[14px] top-[70px] w-[386px]">
      <div className="box-border content-stretch flex flex-col gap-[24px] h-[689px] items-start overflow-clip p-px relative rounded-[inherit] w-[386px]">
        <Card />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

function DisplayPicture5() {
  return (
    <div className="relative rounded-[24px] shrink-0 size-[40px]" data-name="Display Picture">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[24px] size-full" src={imgDisplayPicture} />
    </div>
  );
}

function Heading() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px relative shrink-0" data-name="Heading">
      <p className="font-['Arimo:Bold',_sans-serif] font-bold leading-[28px] relative shrink-0 text-[18px] text-neutral-950 text-nowrap whitespace-pre">Jared Black</p>
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon ↓">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon â">
          <path d={svgPaths.p21688011} fill="var(--fill-0, #121C2D)" id="Icon â_2" />
        </g>
      </svg>
    </div>
  );
}

function Content12() {
  return (
    <div className="bg-white relative rounded-[100px] shrink-0" data-name="Content ↓">
      <div className="box-border content-stretch flex gap-[4px] items-center justify-center overflow-clip p-[4px] relative rounded-[inherit]">
        <Icon17 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#8891aa] border-solid inset-[-1px] pointer-events-none rounded-[101px]" />
    </div>
  );
}

function ButtonContent1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button content ↓">
      <Content12 />
    </div>
  );
}

function Button13() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button">
      <ButtonContent1 />
    </div>
  );
}

function Icon20() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon ↓">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon â">
          <path d={svgPaths.p1840b800} fill="var(--fill-0, #121C2D)" id="Icon â_2" />
        </g>
      </svg>
    </div>
  );
}

function Content13() {
  return (
    <div className="bg-white relative rounded-[100px] shrink-0" data-name="Content ↓">
      <div className="box-border content-stretch flex gap-[4px] items-center justify-center overflow-clip p-[4px] relative rounded-[inherit]">
        <Icon20 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#8891aa] border-solid inset-[-1px] pointer-events-none rounded-[101px]" />
    </div>
  );
}

function ButtonContent2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button content ↓">
      <Content13 />
    </div>
  );
}

function Button14() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button">
      <ButtonContent2 />
    </div>
  );
}

function Icon23() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon ↓">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon â">
          <path d={svgPaths.p6335480} fill="var(--fill-0, #121C2D)" id="Icon â_2" />
        </g>
      </svg>
    </div>
  );
}

function Content14() {
  return (
    <div className="bg-white relative rounded-[100px] shrink-0" data-name="Content ↓">
      <div className="box-border content-stretch flex gap-[4px] items-center justify-center overflow-clip p-[4px] relative rounded-[inherit]">
        <Icon23 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#8891aa] border-solid inset-[-1px] pointer-events-none rounded-[101px]" />
    </div>
  );
}

function ButtonContent3() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button content ↓">
      <Content14 />
    </div>
  );
}

function Button15() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button">
      <ButtonContent3 />
    </div>
  );
}

function Frame33689() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0">
      <Button13 />
      <Button14 />
      <Button15 />
    </div>
  );
}

function Frame34038() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex gap-[10px] items-start p-[10px] relative w-full">
          <DisplayPicture5 />
          <Heading />
          <Frame33689 />
        </div>
      </div>
    </div>
  );
}

function AllPagesHeader() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="All Pages Header">
      <Frame34038 />
    </div>
  );
}

function TabItem() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Tab item ↓">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] items-start justify-center px-[4px] py-[12px] relative size-full">
          <p className="font-['Arimo:Bold',_sans-serif] font-bold leading-[28px] relative shrink-0 text-[18px] text-center text-neutral-950 text-nowrap whitespace-pre">Details</p>
        </div>
      </div>
    </div>
  );
}

function Tab1() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-[46px] items-center min-h-px min-w-px relative shrink-0" data-name="⚙️ Tab 1">
      <div className="h-[0.001px] relative shrink-0 w-[48px]" data-name="Min-width">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[0.001px] w-[48px]" />
      </div>
      <TabItem />
      <div className="bg-[#0263e0] h-[2px] relative shrink-0 w-full" data-name="Bottom border">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[2px] w-full" />
      </div>
    </div>
  );
}

function TabItem1() {
  return (
    <div className="basis-0 box-border content-stretch flex grow items-start justify-center min-h-px min-w-px overflow-clip px-[4px] py-[12px] relative shrink-0" data-name="Tab item ↓">
      <p className="font-['Arimo:Bold',_sans-serif] font-bold leading-[28px] relative shrink-0 text-[18px] text-center text-neutral-950 text-nowrap whitespace-pre">Coverage</p>
    </div>
  );
}

function TabItem2() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-[46px] items-center min-h-px min-w-px relative shrink-0" data-name=". ⚙️ Tab item">
      <div className="h-[0.001px] shrink-0 w-[48px]" data-name="Min-width" />
      <TabItem1 />
      <div className="bg-[rgba(255,255,255,0)] h-[2px] shrink-0 w-full" data-name="Bottom border" />
    </div>
  );
}

function TabItem3() {
  return (
    <div className="basis-0 box-border content-stretch flex gap-[4px] grow items-center justify-center min-h-px min-w-px overflow-clip px-[4px] py-[12px] relative shrink-0" data-name="Tab item ↓">
      <p className="font-['Arimo:Bold',_sans-serif] font-bold leading-[28px] relative shrink-0 text-[18px] text-center text-neutral-950 text-nowrap whitespace-pre">History</p>
    </div>
  );
}

function Tab3() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow h-[46px] items-center min-h-px min-w-px relative shrink-0" data-name="⚙️ Tab 3">
      <div className="h-[0.001px] shrink-0 w-[48px]" data-name="Min-width" />
      <TabItem3 />
      <div className="bg-[rgba(255,255,255,0)] h-[2px] shrink-0 w-full" data-name="Bottom border" />
    </div>
  );
}

function TabContainer() {
  return (
    <div className="basis-0 content-stretch flex grow items-start min-h-px min-w-px relative shrink-0 w-full" data-name="Tab container ↓">
      <div aria-hidden="true" className="absolute border-[#cacdd8] border-[0px_0px_1px] border-solid bottom-[-1px] left-0 pointer-events-none right-0 top-0" />
      <Tab1 />
      <TabItem2 />
      <Tab3 />
    </div>
  );
}

function Tabs() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[46px] items-start relative shrink-0 w-full" data-name="Tabs">
      <TabContainer />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading">
      <p className="font-['Arimo:Bold',_sans-serif] font-bold leading-[28px] relative shrink-0 text-[18px] text-neutral-950 w-full">Personal Information</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Heading1 />
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 font-['Arimo:Bold',_sans-serif] font-bold grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">First Name:</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">Jared</p>
    </div>
  );
}

function Frame4572() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label />
      <Paragraph />
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 font-['Arimo:Bold',_sans-serif] font-bold grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">Middle Name:</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">William</p>
    </div>
  );
}

function Frame4573() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label1 />
      <Paragraph1 />
    </div>
  );
}

function Label2() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 font-['Arimo:Bold',_sans-serif] font-bold grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">Last Name:</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">Black</p>
    </div>
  );
}

function Frame4574() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label2 />
      <Paragraph2 />
    </div>
  );
}

function Frame4576() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
      <Frame4572 />
      <Frame4573 />
      <Frame4574 />
    </div>
  );
}

function Label3() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 font-['Arimo:Bold',_sans-serif] font-bold grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">Phone Number:</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">801-549-3492</p>
    </div>
  );
}

function Frame4575() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label3 />
      <Paragraph3 />
    </div>
  );
}

function Label4() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 font-['Arimo:Bold',_sans-serif] font-bold grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">Secondary Phone:</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">--</p>
    </div>
  );
}

function Frame4578() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label4 />
      <Paragraph4 />
    </div>
  );
}

function Label5() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 font-['Arimo:Bold',_sans-serif] font-bold grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">Email</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">darkknight@gmail.com</p>
    </div>
  );
}

function Frame4579() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label5 />
      <Paragraph5 />
    </div>
  );
}

function Frame4577() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
      <Frame4575 />
      <Frame4578 />
      <Frame4579 />
    </div>
  );
}

function Label6() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 font-['Arimo:Bold',_sans-serif] font-bold grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">Marital Status:</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">Married</p>
    </div>
  );
}

function Frame4580() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label6 />
      <Paragraph6 />
    </div>
  );
}

function Label7() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 font-['Arimo:Bold',_sans-serif] font-bold grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">Mobility Status:</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">Working</p>
    </div>
  );
}

function Frame4581() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label7 />
      <Paragraph7 />
    </div>
  );
}

function Label8() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 font-['Arimo:Bold',_sans-serif] font-bold grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">Beneficiaries:</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">Child, Husband, Sibling</p>
    </div>
  );
}

function Frame4582() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label8 />
      <Paragraph8 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
      <Frame4580 />
      <Frame4581 />
      <Frame4582 />
    </div>
  );
}

function Label9() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 font-['Arimo:Bold',_sans-serif] font-bold grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">Age:</p>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">67</p>
    </div>
  );
}

function Frame4583() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label9 />
      <Paragraph9 />
    </div>
  );
}

function Label10() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 font-['Arimo:Bold',_sans-serif] font-bold grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">Valid State ID or License:</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">Yes</p>
    </div>
  );
}

function Frame4584() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label10 />
      <Paragraph10 />
    </div>
  );
}

function Label11() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 font-['Arimo:Bold',_sans-serif] font-bold grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">Active Bank Account:</p>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">Yes</p>
    </div>
  );
}

function Frame4585() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label11 />
      <Paragraph11 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
      <Frame4583 />
      <Frame4584 />
      <Frame4585 />
    </div>
  );
}

function Frame34089() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[16px] items-start relative w-full">
        <Frame8 />
        <Frame4576 />
        <Frame4577 />
        <Frame10 />
        <Frame9 />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading">
      <p className="font-['Arimo:Bold',_sans-serif] font-bold leading-[28px] relative shrink-0 text-[18px] text-neutral-950 w-full">Lead Eligibility</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[491px]">
      <Heading3 />
    </div>
  );
}

function Label12() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-name="Label">
      <p className="font-['Arimo:Bold',_sans-serif] font-bold leading-[28px] relative shrink-0 text-[14px] text-neutral-950 text-nowrap whitespace-pre">State:</p>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px relative shrink-0" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">Arizona</p>
    </div>
  );
}

function Frame4586() {
  return (
    <div className="basis-0 content-stretch flex gap-[4px] grow items-center min-h-px min-w-px relative shrink-0">
      <Label12 />
      <Paragraph12 />
    </div>
  );
}

function Label13() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-name="Label">
      <p className="font-['Arimo:Bold',_sans-serif] font-bold leading-[28px] relative shrink-0 text-[14px] text-neutral-950 text-nowrap whitespace-pre">Need insurance for:</p>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arimo:Regular',_sans-serif] font-normal leading-[28px] relative shrink-0 text-[14px] text-neutral-950 w-full">Themselves</p>
    </div>
  );
}

function Frame4587() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center min-h-px min-w-px relative shrink-0">
      <Label13 />
      <Paragraph13 />
    </div>
  );
}

function Check() {
  return (
    <div className="absolute left-1/2 size-[16px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="check">
          <path clipRule="evenodd" d={svgPaths.p1d4a0700} fill="var(--fill-0, white)" fillRule="evenodd" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function CheckboxInput() {
  return (
    <div className="bg-[#e1e3ea] relative rounded-[2px] shrink-0 size-[16px]" data-name="⚙️ Checkbox input">
      <div aria-hidden="true" className="absolute border border-[#e1e3ea] border-solid inset-0 pointer-events-none rounded-[2px]" />
      <Check />
    </div>
  );
}

function CheckboxInput1() {
  return (
    <div className="box-border content-stretch flex flex-col items-start px-0 py-[2px] relative rounded-[50px] shrink-0" data-name="Checkbox input ↓">
      <CheckboxInput />
    </div>
  );
}

function Label14() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0 w-full" data-name="Label">
      <p className="basis-0 css-pdu0ot font-['Inter:Medium',_sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[#606b85] text-[14px]">Saw commercial</p>
    </div>
  );
}

function CheckboxLabel() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px relative shrink-0" data-name="Checkbox Label ↓">
      <Label14 />
    </div>
  );
}

function Checkbox() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative self-stretch shrink-0" data-name="Checkbox">
      <div className="size-full">
        <div className="box-border content-stretch flex gap-[8px] items-start pb-[12px] pl-[4px] pr-0 pt-0 relative size-full">
          <CheckboxInput1 />
          <CheckboxLabel />
        </div>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[24px] items-start justify-center relative shrink-0 w-full">
      <Frame4586 />
      <Frame4587 />
      <Checkbox />
    </div>
  );
}

function Frame34091() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[16px] items-start relative w-full">
        <Frame7 />
        <Frame6 />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[648px]" data-name="Heading">
      <p className="font-['Arimo:Bold',_sans-serif] font-bold leading-[28px] relative shrink-0 text-[18px] text-neutral-950 w-full">Notes</p>
    </div>
  );
}

function Frame19() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative w-full">
        <Heading4 />
      </div>
    </div>
  );
}

function FieldText() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative self-stretch shrink-0" data-name="⚙️ Field text ↓">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[10px] items-start px-[12px] py-[8px] relative size-full">
          <p className="basis-0 font-['Arimo:Regular',_sans-serif] font-normal grow leading-[28px] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">Something is written here.</p>
        </div>
      </div>
    </div>
  );
}

function Field() {
  return (
    <div className="basis-0 bg-[#f4f4f6] grow min-h-px min-w-px relative rounded-[4px] shrink-0" data-name="Field ↓">
      <div aria-hidden="true" className="absolute border border-[#8891aa] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <div className="bg-clip-padding border border-[transparent] border-solid box-border content-stretch flex items-start relative w-full">
        <div className="h-[76px] shrink-0 w-[0.001px]" data-name="Min-height" />
        <FieldText />
      </div>
    </div>
  );
}

function Field1() {
  return (
    <div className="relative shrink-0 w-full" data-name="⚙️ Field">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-start relative w-full">
        <Field />
      </div>
    </div>
  );
}

function Textarea() {
  return (
    <div className="relative shrink-0 w-full" data-name="Textarea">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <Field1 />
      </div>
    </div>
  );
}

function Frame34092() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[24px] items-start relative w-full">
        <Frame19 />
        <Textarea />
      </div>
    </div>
  );
}

function Frame34094() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px overflow-x-clip overflow-y-auto relative shrink-0 w-full">
      <Frame34089 />
      <Frame34091 />
      <Frame34092 />
    </div>
  );
}

function Frame34042() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0 w-full">
      <AllPagesHeader />
      <Tabs />
      <Frame34094 />
    </div>
  );
}

function Frame33655() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[4px] shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-start pb-0 pt-[16px] px-[16px] relative size-full">
          <Frame34042 />
        </div>
      </div>
    </div>
  );
}

function AccountPanel() {
  return (
    <div className="h-[687px] relative shrink-0 w-full" data-name="Account Panel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[16px] h-[687px] items-start relative w-full">
        <Frame33655 />
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute bg-white h-[689px] left-[399px] rounded-[14px] top-[70px] w-[828px]">
      <div className="box-border content-stretch flex flex-col gap-[24px] h-[689px] items-start overflow-x-clip overflow-y-auto p-px relative w-[828px]">
        <AccountPanel />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="bg-white relative size-full" data-name="Dashboard">
      <Container3 />
      <Frame482751 />
      <Frame4 />
    </div>
  );
}