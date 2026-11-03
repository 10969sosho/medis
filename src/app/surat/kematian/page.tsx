import { LetterPage } from '@/components/surat/LetterPage';
import { LETTER_META } from '@/lib/letterConfig';

export default function SuratKematianPage() {
  return <LetterPage meta={LETTER_META.kematian} />;
}
