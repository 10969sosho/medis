import { LetterPage } from '@/components/surat/LetterPage';
import { LETTER_META } from '@/lib/letterConfig';

export default function SuratSehatPage() {
  return <LetterPage meta={LETTER_META.sehat} />;
}
