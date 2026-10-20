import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, Star, MapPin, Bed, Bath, MoveRight, Phone, Mail } from 'lucide-react';

const customStyles = `
	html { scroll-behavior: smooth; }
	@keyframes slowPan {
		0% { transform: scale(1.05) translate(0, 0); }
		100% { transform: scale(1.15) translate(-2%, 2%); }
	}
	.animate-slow-pan { animation: slowPan 30s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite alternate; }
	.gold-gradient-text { background: linear-gradient(to right, #B88645, #FBE494, #DEAF5F); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
	.navy-gradient-bg { background: linear-gradient(135deg, #1C2B44 0%, #25416B 50%, #4B7BAE 100%); }
	.gold-gradient-bg { background: linear-gradient(to right, #B88645, #FBE494, #DEAF5F); }
	@keyframes modalBackdrop { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(16px); } }
	@keyframes modalContent { from { opacity: 0; transform: scale(0.95) translateY(60px); } to { opacity: 1; transform: scale(1) translateY(0); } }
	.animate-backdrop { animation: modalBackdrop 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
	.animate-modal { animation: modalContent 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.1s; opacity: 0; }
	::-webkit-scrollbar { width: 8px; }
	::-webkit-scrollbar-track { background: #F6F2E9; }
	::-webkit-scrollbar-thumb { background: #1C2B44; border-radius: 10px; }
`;

const useScrollReveal = (threshold = 0.1) => {
	const ref = useRef(null);
	const [isVisible, setIsVisible] = useState(false);
	useEffect(() => {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); }
		}, { threshold, rootMargin: '0px 0px -50px 0px' });
		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, [threshold]);
	return [ref, isVisible];
};

const useParallax = (speed = 0.3) => {
	const ref = useRef(null);
	useEffect(() => {
		const handleScroll = () => {
			if (ref.current) ref.current.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [speed]);
	return ref;
};

const MagneticButton = ({ children, className = '', onClick, type = 'button' }) => {
	const ref = useRef(null);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const handleMouseMove = (e) => {
		const { left, top, width, height } = ref.current.getBoundingClientRect();
		setPosition({ x: (e.clientX - left - width / 2) * 0.4, y: (e.clientY - top - height / 2) * 0.4 });
	};
	return <button type={type} ref={ref} onMouseMove={handleMouseMove} onMouseLeave={() => setPosition({ x: 0, y: 0 })} onClick={onClick} className={`relative transition-all duration-300 ease-out ${className}`} style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}>{children}</button>;
};

const Reveal = ({ children, delay = 0, className = '', direction = 'up' }) => {
	const [ref, isVisible] = useScrollReveal();
	const transforms = { up: 'translate3d(0, 80px, 0)', left: 'translate3d(-80px, 0, 0)', right: 'translate3d(80px, 0, 0)', scale: 'scale(0.9)' };
	return <div ref={ref} className={`transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`} style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translate3d(0,0,0) scale(1)' : (transforms[direction] || transforms.up), transitionDelay: `${delay}ms` }}>{children}</div>;
};

const MaskedText = ({ text, delay = 0, className = '' }) => {
	const [ref, isVisible] = useScrollReveal(0.5);
	return <div ref={ref} className={`overflow-hidden inline-block ${className}`}><div className="transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 110%, 0)', transitionDelay: `${delay}ms` }}>{text}</div></div>;
};

const ParallaxImage = ({ src, alt, className = '' }) => {
	const [ref, isVisible] = useScrollReveal();
	const imgRef = useRef(null);
	useEffect(() => {
		const handleScroll = () => {
			if (!ref.current || !imgRef.current) return;
			const rect = ref.current.getBoundingClientRect();
			const scrolled = window.innerHeight - rect.top;
			if (scrolled > 0 && scrolled < window.innerHeight + rect.height) imgRef.current.style.transform = `translate3d(0, ${(scrolled - window.innerHeight) * 0.15}px, 0) scale(1.15)`;
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);
	return <div ref={ref} className={`overflow-hidden relative ${className}`}><img ref={imgRef} src={src} alt={alt} className="w-full h-full object-cover transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ opacity: isVisible ? 1 : 0 }} /></div>;
};

const SectionHeader = ({ title, subtitle, isDark = false }) => (
	<div className="mb-24 flex flex-col items-center text-center">
		<Reveal direction="scale"><div className="h-px w-24 gold-gradient-bg mb-8" /></Reveal>
		<h2 className={`text-4xl md:text-6xl font-serif tracking-wide mb-6 ${isDark ? 'text-[#F6F2E9]' : 'text-[#1C2B44]'}`}><MaskedText text={title} /></h2>
		{subtitle && <Reveal delay={200}><p className={`text-xs md:text-sm tracking-[0.3em] uppercase ${isDark ? 'gold-gradient-text' : 'text-[#B88645]'}`}>{subtitle}</p></Reveal>}
	</div>
);

const Modal = ({ isOpen, onClose, children }) => {
	if (!isOpen) return null;
	return <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12"><div className="absolute inset-0 bg-[#1C2B44]/80 animate-backdrop cursor-pointer" onClick={onClose} /><div className="relative bg-[#F6F2E9] w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl z-10 animate-modal border border-[#DEAF5F]/20"><MagneticButton onClick={onClose} className="absolute top-8 right-8 text-[#1C2B44] hover:text-[#DEAF5F] z-20 bg-white/50 p-4 rounded-full backdrop-blur-md"><X size={24} /></MagneticButton>{children}</div></div>;
};

export default function App() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [activeModal, setActiveModal] = useState({ type: null, data: null });
	const heroParallaxRef = useParallax(0.4);
	const closeModal = () => setActiveModal({ type: null, data: null });
	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 80);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);
	useEffect(() => {
		document.body.style.overflow = activeModal.type ? 'hidden' : 'unset';
		return () => { document.body.style.overflow = 'unset'; };
	}, [activeModal.type]);

	return (
		<div className="bg-[#F6F2E9] text-[#1C2B44] font-sans overflow-x-hidden selection:bg-[#B88645] selection:text-white">
			<style>{customStyles}</style>
			<nav className={`fixed w-full z-50 transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'navy-gradient-bg py-5 shadow-2xl backdrop-blur-lg bg-opacity-90' : 'bg-transparent py-8'}`}>
				<div className="max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center">
					<div className="flex flex-col z-50 relative cursor-pointer group"><span className="text-2xl font-serif tracking-widest text-[#F6F2E9] transition-transform duration-500 group-hover:scale-105">MATTHEW ATKINSON</span><span className="text-[9px] tracking-[0.4em] uppercase gold-gradient-text mt-1 opacity-70 group-hover:opacity-100 transition-opacity duration-500">Property Done Properly</span></div>
					<div className="hidden lg:flex items-center space-x-10">
						{['Home', 'About', 'Listings', 'Areas', 'Blogs', 'Reviews', 'Contact'].map((item) => <MagneticButton key={item}><a href={`#${item.toLowerCase()}`} className="text-[11px] uppercase tracking-[0.2em] text-[#F6F2E9] hover:text-[#DEAF5F] transition-colors duration-500">{item}</a></MagneticButton>)}
						<MagneticButton onClick={() => setActiveModal({ type: 'search', data: true })}><div className="text-[#F6F2E9] hover:text-[#DEAF5F] transition-colors p-2"><Search size={22} /></div></MagneticButton>
					</div>
					<MagneticButton onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-[#F6F2E9] z-50">{isMenuOpen ? <X size={32} /> : <Menu size={32} />}</MagneticButton>
				</div>
				<div className={`fixed inset-0 navy-gradient-bg flex flex-col justify-center items-center space-y-10 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
					{['Home', 'About', 'Listings', 'Areas', 'Blogs', 'Reviews', 'Contact'].map((item, i) => <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className={`text-4xl font-serif text-[#F6F2E9] hover:text-[#DEAF5F] transition-transform duration-[1000ms] delay-${i * 100} ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>{item}</a>)}
				</div>
			</nav>

			<section id="home" className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
				<div ref={heroParallaxRef} className="absolute inset-0 z-0 h-[120%] -top-[10%]"><img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" alt="Luxury Property" className="w-full h-full object-cover opacity-50 animate-slow-pan" /></div>
				<div className="relative z-10 text-center px-6 mt-20 max-w-5xl">
					<div className="flex flex-col items-center space-y-4 mb-8"><MaskedText text="Elevate Your" className="text-6xl md:text-8xl lg:text-9xl font-serif text-[#F6F2E9] tracking-tight" delay={100} /><MaskedText text="Standard of Living" className="text-6xl md:text-8xl lg:text-9xl font-serif text-[#F6F2E9] tracking-tight" delay={300} /></div>
					<Reveal delay={600}><p className="text-sm md:text-base tracking-[0.4em] uppercase gold-gradient-text mb-16">Property Done Properly</p></Reveal>
					<Reveal delay={900}><MagneticButton><a href="#listings" className="inline-flex items-center space-x-6 border border-[#B88645] px-10 py-5 text-[#F6F2E9] hover:bg-[#B88645] transition-all duration-700 group backdrop-blur-sm"><span className="text-[11px] uppercase tracking-[0.25em]">Explore Collection</span><MoveRight size={18} className="group-hover:translate-x-4 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" /></a></MagneticButton></Reveal>
				</div>
			</section>

			<section id="about" className="py-40 px-6 md:px-12 max-w-[1400px] mx-auto overflow-hidden">
				<SectionHeader title="The Artisan Approach" subtitle="About Matthew Atkinson" />
				<div className="grid md:grid-cols-2 gap-24 items-center">
					<ParallaxImage src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000" alt="Matthew Atkinson" className="h-[700px] w-full rounded-sm shadow-2xl" />
					<div className="space-y-12"><Reveal direction="left" delay={100}><h3 className="text-4xl md:text-5xl font-serif text-[#1C2B44] leading-tight">Redefining luxury real estate through precision.</h3></Reveal><Reveal delay={200}><p className="text-lg text-gray-600 leading-relaxed font-light">As an upcoming authority in the luxury property market, I believe that a home is more than an asset; it is a masterpiece of lifestyle. My team and I are dedicated to curating an experience that matches the caliber of the properties we represent.</p></Reveal><Reveal delay={300}><div className="pt-10 border-t border-[#DEAF5F]/30"><h4 className="text-xs uppercase tracking-[0.2em] text-[#B88645] mb-6">Our Firm</h4><p className="text-gray-600 leading-relaxed font-light">Backed by a team of elite industry veterans, marketers, and legal minds, we provide a holistic approach to real estate that guarantees exceptional results, absolute discretion, and a seamless transition of legacy.</p></div></Reveal></div>
				</div>
			</section>

			<section id="listings" className="py-40 bg-white"><div className="max-w-[1400px] mx-auto px-6 md:px-12"><SectionHeader title="Exclusive Collection" subtitle="Featured Properties" /><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16 mt-24">
				{[1, 2, 3].map((item, index) => <Reveal key={item} delay={index * 200}><div className="group cursor-pointer block" onClick={() => setActiveModal({ type: 'listing', data: { id: item, title: '123 Luxury Lane, Prestige Estate', price: '$4,500,000', beds: 4, baths: 5, area: 'Constantia' } })}><div className="overflow-hidden relative h-[500px] w-full mb-8 shadow-lg"><img src={`https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800&sig=${item}`} alt="Property" className="w-full h-full object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" /><div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" /><div className="absolute inset-0 border border-transparent group-hover:border-[#DEAF5F]/50 transition-colors duration-700 m-6" /><div className="absolute bottom-8 left-8 right-8 flex justify-center text-white opacity-0 transform translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 z-10"><span className="text-xs uppercase tracking-[0.2em] border-b border-[#DEAF5F] pb-2">View Details</span></div></div><div className="space-y-4 px-2 transform transition-transform duration-700 group-hover:-translate-y-2"><div className="flex justify-between items-center"><p className="text-3xl font-serif text-[#1C2B44]">$4,500,000</p><p className="text-[10px] uppercase tracking-widest text-[#B88645] px-3 py-1 border border-[#B88645]">Active</p></div><h3 className="text-xl text-gray-800 font-light">123 Luxury Lane, Prestige Estate</h3><div className="flex space-x-6 text-sm text-gray-500 font-light pt-4 border-t border-gray-100"><span className="flex items-center"><Bed size={16} className="mr-2 text-[#DEAF5F]" /> 4 Beds</span><span className="flex items-center"><Bath size={16} className="mr-2 text-[#DEAF5F]" /> 5 Baths</span></div></div></div></Reveal>)}
			</div><Reveal delay={400} className="mt-32 flex justify-center"><MagneticButton onClick={() => setActiveModal({ type: 'allListings', data: true })}><div className="px-12 py-5 border border-[#1C2B44] text-[#1C2B44] hover:bg-[#1C2B44] hover:text-[#F6F2E9] transition-colors duration-700 text-xs uppercase tracking-[0.25em]">View Entire Portfolio</div></MagneticButton></Reveal></div></section>

			<section id="reviews" className="py-40 navy-gradient-bg relative overflow-hidden"><div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[#DEAF5F] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" /><div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10"><SectionHeader title="Client Testimonials" subtitle="A Legacy of Trust" isDark /><div className="grid md:grid-cols-3 gap-12 mt-24">{[1, 2, 3].map((item, index) => <Reveal key={item} delay={index * 200}><div className="bg-[#F6F2E9] p-12 relative shadow-2xl transform transition-transform duration-[1000ms] hover:-translate-y-4"><div className="flex space-x-1 mb-8">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={18} className="text-[#DEAF5F] fill-current" />)}</div><p className="text-gray-700 italic font-serif text-lg leading-relaxed mb-10">"Matthew's attention to detail and understanding of the luxury market is unmatched. He made the process of selling our estate entirely effortless and secure."</p><div className="border-t border-[#1C2B44]/10 pt-6"><p className="text-[#1C2B44] font-semibold uppercase tracking-widest text-xs mb-1">James &amp; Sarah W.</p><p className="text-[10px] uppercase tracking-widest text-[#B88645]">Sellers, Camps Bay</p></div></div></Reveal>)}</div><Reveal delay={600} className="mt-32 text-center"><MagneticButton onClick={() => setActiveModal({ type: 'review', data: true })}><div className="text-[#F6F2E9] border-b border-[#DEAF5F] pb-2 hover:text-[#DEAF5F] transition-colors uppercase tracking-[0.2em] text-xs">Share Your Experience</div></MagneticButton></Reveal></div></section>

			<section id="areas" className="py-40 bg-[#F6F2E9]"><div className="max-w-[1400px] mx-auto px-6 md:px-12"><SectionHeader title="Prime Locations" subtitle="Explore Our Suburbs" /><div className="grid md:grid-cols-2 gap-8 mt-16">{['Camps Bay', 'Constantia', 'Clifton', 'Bantry Bay'].map((area, index) => <Reveal key={area} delay={index * 100} direction="scale"><div className="relative h-[400px] group cursor-pointer overflow-hidden shadow-2xl" onClick={() => setActiveModal({ type: 'area', data: { name: area } })}><img src={`https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800&sig=${index}`} alt={area} className="w-full h-full object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" /><div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700" /><div className="absolute inset-0 border border-transparent group-hover:border-[#DEAF5F]/50 transition-colors duration-700 m-6" /><h3 className="absolute bottom-10 left-10 text-4xl font-serif text-[#F6F2E9] transform transition-transform duration-700 group-hover:-translate-y-2">{area}</h3><div className="absolute bottom-10 right-10 opacity-0 transform translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700"><span className="text-xs uppercase tracking-[0.2em] text-white border-b border-[#DEAF5F] pb-2">Explore Area</span></div></div></Reveal>)}</div></div></section>

			<section id="blogs" className="py-40 bg-white"><div className="max-w-[1400px] mx-auto px-6 md:px-12"><SectionHeader title="Market Insights" subtitle="News & Updates" /><div className="grid md:grid-cols-3 gap-12 mt-16">{[{ title: 'The Future of Luxury Real Estate', excerpt: 'Discover what the next decade holds for premium properties and architectural innovations.' }, { title: 'Investing in Coastal Homes', excerpt: 'Why waterfront properties remain the most resilient asset class in a shifting economy.' }, { title: 'Architectural Trends of 2024', excerpt: 'The seamless blend of indoor and outdoor living spaces is reshaping buyer demands.' }].map((blog, index) => <Reveal key={index} delay={index * 150}><div className="group cursor-pointer block h-full" onClick={() => setActiveModal({ type: 'blog', data: blog })}><div className="h-[300px] overflow-hidden mb-8 shadow-lg relative"><img src={`https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800&sig=${index + 10}`} alt="Blog" className="w-full h-full object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" /><div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" /></div><p className="text-[10px] uppercase tracking-[0.2em] text-[#B88645] mb-3 border-l-2 border-[#B88645] pl-3">Market Insights</p><h3 className="text-2xl font-serif text-[#1C2B44] mb-4 group-hover:text-[#B88645] transition-colors duration-500">{blog.title}</h3><p className="text-gray-600 font-light text-sm leading-relaxed mb-6">{blog.excerpt}</p><span className="text-xs uppercase tracking-[0.2em] text-[#1C2B44] group-hover:text-[#B88645] transition-colors border-b border-transparent group-hover:border-[#B88645] pb-1">Read Article</span></div></Reveal>)}</div></div></section>

			<section id="contact" className="py-40 bg-[#F6F2E9]"><div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col items-center"><SectionHeader title="Initiate a Conversation" subtitle="Contact Us" /><Reveal delay={200} className="w-full max-w-2xl mt-12"><form className="space-y-10" onSubmit={(e) => { e.preventDefault(); e.target.reset(); closeModal(); }}><div className="grid md:grid-cols-2 gap-10"><input type="text" placeholder="First Name" className="w-full bg-transparent border-b border-[#1C2B44]/30 py-4 focus:outline-none focus:border-[#B88645] transition-colors text-[#1C2B44] placeholder-[#1C2B44]/50" required /><input type="text" placeholder="Last Name" className="w-full bg-transparent border-b border-[#1C2B44]/30 py-4 focus:outline-none focus:border-[#B88645] transition-colors text-[#1C2B44] placeholder-[#1C2B44]/50" required /></div><input type="email" placeholder="Email Address" className="w-full bg-transparent border-b border-[#1C2B44]/30 py-4 focus:outline-none focus:border-[#B88645] transition-colors text-[#1C2B44] placeholder-[#1C2B44]/50" required /><textarea placeholder="Your Message" rows="5" className="w-full bg-transparent border-b border-[#1C2B44]/30 py-4 focus:outline-none focus:border-[#B88645] transition-colors text-[#1C2B44] placeholder-[#1C2B44]/50 resize-none" required /><div className="flex justify-center pt-8"><MagneticButton type="submit"><div className="px-16 py-6 border border-[#1C2B44] text-[#1C2B44] hover:bg-[#1C2B44] hover:text-[#F6F2E9] uppercase tracking-[0.25em] text-xs transition-colors duration-700">Send Inquiry</div></MagneticButton></div></form></Reveal></div></section>

			<footer className="navy-gradient-bg py-32 text-[#F6F2E9] border-t border-[#DEAF5F]/20 relative overflow-hidden"><Reveal><div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-4 gap-16 relative z-10"><div className="col-span-1 md:col-span-2"><h3 className="text-3xl font-serif tracking-widest mb-4">MATTHEW ATKINSON</h3><p className="text-xs tracking-[0.4em] uppercase gold-gradient-text mb-10">Property Done Properly</p><div className="flex space-x-6"><a href="#contact" className="text-[#F6F2E9]/70 hover:text-[#DEAF5F] transition-colors"><Mail size={20} /></a><a href="#contact" className="text-[#F6F2E9]/70 hover:text-[#DEAF5F] transition-colors"><Phone size={20} /></a><a href="#areas" className="text-[#F6F2E9]/70 hover:text-[#DEAF5F] transition-colors"><MapPin size={20} /></a></div></div><div><h4 className="text-[10px] uppercase tracking-[0.2em] text-[#DEAF5F] mb-8">Navigation</h4><ul className="space-y-6 text-xs uppercase tracking-widest font-light opacity-80"><li><a href="#home" className="hover:text-[#DEAF5F]">Home</a></li><li><a href="#about" className="hover:text-[#DEAF5F]">About</a></li><li><a href="#listings" className="hover:text-[#DEAF5F]">Listings</a></li><li><a href="#areas" className="hover:text-[#DEAF5F]">Areas</a></li></ul></div><div><h4 className="text-[10px] uppercase tracking-[0.2em] text-[#DEAF5F] mb-8">Connect</h4><ul className="space-y-6 text-xs uppercase tracking-widest font-light opacity-80"><li><a href="#blogs" className="hover:text-[#DEAF5F]">Insights</a></li><li><a href="#reviews" className="hover:text-[#DEAF5F]">Reviews</a></li><li><a href="#contact" className="hover:text-[#DEAF5F]">Contact</a></li></ul></div></div><div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-24 pt-8 border-t border-[#F6F2E9]/10 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest uppercase font-light text-[#F6F2E9]/50"><p>&copy; 2024 Matthew Atkinson Property. All rights reserved.</p><p className="mt-4 md:mt-0">Design &amp; Architecture</p></div></Reveal></footer>

			<Modal isOpen={activeModal.type !== null} onClose={closeModal}>
				{activeModal.type === 'listing' && activeModal.data && <div className="flex flex-col md:flex-row h-full"><div className="w-full md:w-1/2 h-[40vh] md:h-[80vh]"><img src={`https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000&sig=${activeModal.data.id}`} className="w-full h-full object-cover" alt="Property" /></div><div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center bg-[#F6F2E9]"><p className="text-xs uppercase tracking-[0.3em] text-[#B88645] mb-4">Exclusive Listing</p><h3 className="text-4xl md:text-5xl font-serif text-[#1C2B44] mb-6">{activeModal.data.title}</h3><p className="text-3xl text-gray-800 mb-10">{activeModal.data.price}</p><p className="text-gray-600 font-light leading-relaxed mb-12 text-lg">This magnificent property offers breathtaking views, unparalleled security, and bespoke finishes throughout. A true masterpiece of modern architecture tailored for the most discerning buyer.</p><div className="flex space-x-8 text-sm text-[#1C2B44] font-light mb-12"><span className="flex items-center"><Bed size={20} className="mr-3 text-[#DEAF5F]" /> {activeModal.data.beds || 4} Beds</span><span className="flex items-center"><Bath size={20} className="mr-3 text-[#DEAF5F]" /> {activeModal.data.baths || 5} Baths</span></div><MagneticButton onClick={() => { closeModal(); window.location.href = '#contact'; }}><div className="w-full navy-gradient-bg text-[#F6F2E9] py-6 text-center uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-opacity">Enquire Confidentially</div></MagneticButton></div></div>}
				{activeModal.type === 'allListings' && <div className="p-8 md:p-16 bg-[#F6F2E9]"><h3 className="text-4xl md:text-5xl font-serif text-[#1C2B44] mb-16 text-center mt-8">Entire Portfolio</h3><div className="grid md:grid-cols-3 gap-10">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="mb-8 group"><div className="h-64 overflow-hidden mb-6 shadow-md cursor-pointer relative" onClick={() => setActiveModal({ type: 'listing', data: { id: item, title: `Prestige Villa ${item}`, price: '$Price Upon Request', beds: 4, baths: 4, area: 'Exclusive Estate' } })}><img src={`https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600&sig=${item + 20}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms]" alt="Portfolio Item" /><div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" /></div><div className="flex justify-between items-center mb-2"><h4 className="text-xl font-serif text-[#1C2B44]">Prestige Villa {item}</h4><p className="text-sm font-serif text-[#1C2B44]">POA</p></div><p className="text-xs uppercase tracking-widest text-[#B88645]">Exclusive Estate</p></div>)}</div></div>}
				{activeModal.type === 'review' && <div className="p-12 md:p-24 bg-[#F6F2E9] max-w-3xl mx-auto flex flex-col justify-center min-h-[60vh]"><h3 className="text-4xl font-serif text-[#1C2B44] mb-4 text-center">Share Your Experience</h3><p className="text-center text-gray-500 mb-12 font-light">Your feedback ensures we maintain the highest standards of luxury service.</p><form onSubmit={(e) => { e.preventDefault(); closeModal(); }} className="space-y-8"><input type="text" placeholder="Your Full Name" className="w-full bg-transparent border-b border-[#1C2B44]/30 py-4 focus:outline-none focus:border-[#B88645] text-[#1C2B44] transition-colors" required /><input type="text" placeholder="Property / Location (Optional)" className="w-full bg-transparent border-b border-[#1C2B44]/30 py-4 focus:outline-none focus:border-[#B88645] text-[#1C2B44] transition-colors" /><textarea placeholder="Your Testimonial" rows="5" className="w-full bg-transparent border-b border-[#1C2B44]/30 py-4 focus:outline-none focus:border-[#B88645] text-[#1C2B44] transition-colors resize-none" required /><div className="pt-6"><MagneticButton type="submit" className="w-full"><div className="w-full border border-[#1C2B44] text-[#1C2B44] hover:bg-[#1C2B44] hover:text-[#F6F2E9] py-5 uppercase tracking-[0.2em] text-xs transition-colors duration-700 text-center">Submit Testimonial</div></MagneticButton></div></form></div>}
				{activeModal.type === 'search' && <div className="p-12 md:p-32 flex flex-col items-center justify-center min-h-[50vh] bg-[#F6F2E9]"><p className="text-xs uppercase tracking-[0.3em] text-[#B88645] mb-6">Discover</p><h3 className="text-4xl md:text-6xl font-serif text-[#1C2B44] mb-16 text-center">Find Your Masterpiece</h3><div className="w-full max-w-3xl relative"><input type="text" placeholder="Search properties, areas, or insights..." className="w-full bg-transparent border-b-2 border-[#1C2B44]/30 py-6 text-2xl md:text-3xl focus:outline-none focus:border-[#B88645] text-[#1C2B44] placeholder-[#1C2B44]/30 transition-colors" autoFocus /><Search className="absolute right-4 top-8 text-[#1C2B44]/50" size={32} /></div><div className="mt-16 flex space-x-6 text-sm text-[#1C2B44]/60 font-light"><span>Popular:</span>{['Camps Bay', 'Waterfront', 'Penthouses'].map((term) => <span key={term} className="hover:text-[#B88645] cursor-pointer transition-colors" onClick={closeModal}>{term}</span>)}</div></div>}
				{activeModal.type === 'blog' && activeModal.data && <div className="p-8 md:p-24 bg-white"><p className="text-xs uppercase tracking-[0.3em] text-[#B88645] mb-6 border-l-2 border-[#B88645] pl-3">Market Insights</p><h3 className="text-4xl md:text-6xl font-serif text-[#1C2B44] mb-12 leading-tight">{activeModal.data.title}</h3><div className="prose prose-lg max-w-none text-gray-700 font-light leading-relaxed space-y-8"><p className="font-medium text-2xl text-[#1C2B44] leading-relaxed">{activeModal.data.excerpt}</p><p>The landscape of luxury property continues to evolve rapidly. High-net-worth individuals are no longer simply looking for grand spaces; they are seeking meticulously curated environments that offer a seamless integration of wellness, technology, and absolute privacy.</p><p>As we analyze the current market trends, it becomes overwhelmingly evident that locations offering natural seclusion without sacrificing proximity to cultural hubs are commanding unprecedented premiums. Architectural designs that blur the boundary between indoor and outdoor living are particularly sought after.</p><p>Investing in such assets is not merely a financial decision, but a profound commitment to a specific standard of living—one that prioritizes peace of mind above all else.</p></div></div>}
				{activeModal.type === 'area' && activeModal.data && <div className="flex flex-col md:flex-row h-full"><div className="w-full md:w-1/2 h-[40vh] md:h-[80vh]"><img src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Area" /></div><div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center bg-[#F6F2E9]"><p className="text-xs uppercase tracking-[0.3em] text-[#B88645] mb-4">Area Guide</p><h3 className="text-4xl md:text-6xl font-serif text-[#1C2B44] mb-8">{activeModal.data.name}</h3><p className="text-gray-600 font-light leading-relaxed mb-16 text-lg">Experience the pinnacle of luxury living in {activeModal.data.name}. Known for its pristine environments, exceptional amenities, and unparalleled lifestyle opportunities. This exclusive suburb represents the gold standard of real estate investment.</p><MagneticButton onClick={() => setActiveModal({ type: 'allListings', data: true })}><div className="w-full border border-[#1C2B44] text-[#1C2B44] py-6 text-center uppercase tracking-[0.2em] text-xs hover:bg-[#1C2B44] hover:text-[#F6F2E9] transition-colors duration-700">View Local Properties</div></MagneticButton></div></div>}
			</Modal>
		</div>
	);
}
