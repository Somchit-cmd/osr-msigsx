import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-white py-6 mt-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <p className="text-text-muted text-sm text-center">
            © {new Date().getFullYear()} {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
