
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Search, ExternalLink } from 'lucide-react';
import { QURAN_LINK, SAHIFA_SAJJADIYA_LINK, NAHJ_AL_BALAGHA_LINK } from '../constants';

interface IconLinkCardProps {
  to?: string;
  href?: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const IconLinkCard: React.FC<IconLinkCardProps> = ({ to, href, icon, title, description }) => {
  const commonProps = "block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 text-center text-textPrimary";
  const content = (
    <>
      <div className="flex justify-center text-accent mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-textSecondary">{description}</p>
      {href && <ExternalLink size={16} className="inline-block ml-1 text-primary-dark" />}
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={commonProps}>
        {content}
      </a>
    );
  }
  return (
    <Link to={to!} className={commonProps}>
      {content}
    </Link>
  );
};


export const HomePage: React.FC = () => {
  return (
    <div className="space-y-12">
      <header className="text-center py-10 bg-gradient-to-r from-primary to-accent text-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-3">مرحباً بك في مدينة العلم</h1>
        <p className="text-lg">استكشف النصوص، ترجم، استمع، وابحث في المعرفة العالمية.</p>
      </header>

      <section>
        <h2 className="text-3xl font-semibold text-center mb-8 text-textPrimary">الميزات الرئيسية</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <IconLinkCard
            to="/reader"
            icon={<FileText size={48} />}
            title="قارئ PDF الذكي"
            description="اقرأ ملفات PDF مع أدوات تحكم متقدمة، ترجمة، تلخيص، وقراءة صوتية."
          />
          <IconLinkCard
            to="/research"
            icon={<Search size={48} />}
            title="باحث المعرفة"
            description="ابحث في الأوراق العلمية العالمية المفتوحة المصدر واحصل على ملخصات مترجمة."
          />
           <IconLinkCard
            to="/reader" // Or a dedicated search page
            icon={<BookOpen size={48} />}
            title="البحث المعزز بالذكاء الاصطناعي"
            description="استخدم Gemini للمساعدة في البحث داخل مستنداتك أو لطرح أسئلة عامة."
          />
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold text-center mb-8 text-textPrimary">نصوص إسلامية قيمة</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <IconLinkCard
            href={QURAN_LINK}
            icon={<img src="https://picsum.photos/seed/quran/48/48" alt="Quran" className="w-12 h-12 mx-auto" />} // Placeholder icon
            title="القرآن الكريم"
            description="النص الكامل للقرآن الكريم مع تلاوات وتفاسير."
          />
          <IconLinkCard
            href={SAHIFA_SAJJADIYA_LINK}
            icon={<img src="https://picsum.photos/seed/sahifa/48/48" alt="Sahifa" className="w-12 h-12 mx-auto" />} // Placeholder icon
            title="الصحيفة السجادية"
            description="مجموعة أدعية الإمام زين العابدين (ع)."
          />
          <IconLinkCard
            href={NAHJ_AL_BALAGHA_LINK}
            icon={<img src="https://picsum.photos/seed/nahj/48/48" alt="Nahj" className="w-12 h-12 mx-auto" />} // Placeholder icon
            title="نهج البلاغة"
            description="مجموعة خطب ورسائل وأقوال الإمام علي (ع)."
          />
        </div>
      </section>
    </div>
  );
};