// src/components/CampaignsSection.tsx
import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader, Zap, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { campaignService } from '../../services/campaignService';

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  target: number;
  raised: number;
  imageUrl?: string | null;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ id, title, description, target, raised, imageUrl }) => {
  const navigate = useNavigate();
  const progressPercent = Math.min(100, Math.max(0, (raised / (target || 1)) * 100));

  const handleCardClick = () => navigate(`/campaigns/${id}`);
  const handleDonateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/donate?campaignId=${id}`);
  };

  // fallback image: use provided imageUrl or Unsplash with the title as keyword
  //const fallbackImage = `https://source.unsplash.com/800x450/?${encodeURIComponent((title || 'charity').split(' ')[0])}`;
  const fallbackImage = `https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80`;

  const finalImage = imageUrl || fallbackImage;

  return (
    <div
      onClick={handleCardClick}
      className="group relative w-80 shrink-0 snap-center cursor-pointer flex flex-col bg-white/2 border border-white/10 backdrop-blur-xl rounded-4xl overflow-hidden transition-all duration-500 hover:border-cyan-400/40 hover:bg-white/5"
    >
      {/* Visual Header - image background */}
      <div className="relative h-40 overflow-hidden bg-slate-950">
        {/* image */}
        <img
          src={finalImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transform transition-transform duration-700"
        />
        {/* subtle overlay */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Status badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Node</span>
          </div>
        </div>
        <Zap className="absolute bottom-4 right-4 w-5 h-5 text-cyan-400/30 group-hover:text-cyan-400 transition-colors z-10" />
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h4 className="text-xl font-black text-white tracking-tight leading-tight group-hover:text-cyan-400 transition-colors truncate">
            {title}
          </h4>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Verified Campaign</p>
        </div>

        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 line-clamp-2">
          {description}
        </p>

        {/* Trust Box */}
        <div className="mb-6 p-3 rounded-xl bg-black/20 border border-white/5 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-cyan-500/50" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Protocol</span>
            </div>
            <span className="text-[9px] font-black text-white uppercase italic">Escrow Protected</span>
          </div>
        </div>

        {/* Funding Progress */}
        <div className="mt-auto">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Target Liquidity</p>
              <p className="text-lg font-black text-white tracking-tighter">${target.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-cyan-400 italic leading-none">{progressPercent.toFixed(0)}%</p>
            </div>
          </div>

          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-emerald-400 transition-all duration-1000 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <button
            onClick={handleDonateClick}
            className="w-full mt-6 bg-white text-slate-950 hover:bg-cyan-400 hover:text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 shadow-xl shadow-cyan-500/5"
          >
            Initiate Donation
          </button>
        </div>
      </div>
    </div>
  );
};

const CampaignsSection: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await campaignService.getAllCampaigns();
        const list = Array.isArray(data) ? data : (data as any).campaigns || [];
        const activeCampaigns = list.filter((c: any) => c.status?.toUpperCase() === 'ACTIVE');

        // Limit and normalize to ensure imageUrl exists (optional: backend can provide imageUrl)
        const normalized = activeCampaigns.slice(0, 10).map((c: any) => ({
          ...c,
          imageUrl: c.imageUrl || undefined,
        }));

        setCampaigns(normalized);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <section id="campaigns" className="py-12 px-6 relative bg-transparent overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-px bg-cyan-500/50" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-cyan-400">
                Direct Impact Indices
              </h2>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">
              Active Funding Campaigns.
            </h2>
            <p className="text-slate-400 text-sm font-medium max-w-lg">
              High-trust campaigns - funds move to escrow and are released only after verification.
            </p>
          </div>

          <Link
            to="/campaigns"
            className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
          >
            Browse All Campaigns
            <span className="w-8 h-px bg-slate-800 group-hover:w-12 group-hover:bg-cyan-400 transition-all duration-300" />
          </Link>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="group relative">
          <div
            className="flex space-x-6 pb-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading && (
              <div className="w-full flex justify-center items-center py-20">
                <Loader className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            )}

            {!loading && campaigns.length === 0 && (
              <div className="w-full text-center py-10 border border-white/5 rounded-3xl bg-white/2 backdrop-blur-sm">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No active nodes detected</p>
              </div>
            )}

            {!loading && campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                id={campaign.id}
                title={campaign.title}
                description={campaign.description}
                target={Number(campaign.targetAmount || 0)}
                raised={Number(campaign.amountRaised || 0)}
                imageUrl={campaign.imageUrl}
              />
            ))}
          </div>

          {/* Edge Fade */}
          <div className="absolute top-0 right-0 bottom-8 w-24 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default CampaignsSection;
