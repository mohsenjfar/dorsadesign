// frontend/src/components/home/Hero.jsx
const Hero = () => {
  return (
    <section>
      {/* ۱. تصویر یا گرادیانت پس‌زمینه */}
      <div className="absolute inset-0 bg-gradient-to-br ..." />
      
      {/* ۲. محتوای اصلی */}
      <div>
        {/* عنوان اصلی */}
        <h1>dorsadesign</h1>
        
        {/* زیرنویس */}
        <p>Architecture & Design Portfolio</p>
        
        {/* دکمه CTA */}
        <a href="#projects">View Our Projects</a>
      </div>
    </section>
  )
}

export default Hero