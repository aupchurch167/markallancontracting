import { CONTACT, SITE } from '@/lib/constants';
import { PhoneLink } from './PhoneLink';
import { Eyebrow } from './Section';

/** On-page NAP strip — same values as the footer, used on money pages. */
export function NapBlock({
  phone,
  phoneRaw,
  email,
  eyebrow = 'Atlanta office',
}: {
  phone: string;
  phoneRaw: string;
  email: string;
  eyebrow?: string;
}) {
  const a = CONTACT.address;
  return (
    <div className="max-w-3xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <address className="mt-4 space-y-1 text-lg not-italic leading-relaxed text-body">
        <div className="font-semibold text-ink">{SITE.name}</div>
        <div>{a.street}</div>
        <div>
          {a.city}, {a.state} {a.zip}
        </div>
        <div className="pt-2">
          <PhoneLink
            phone={phone}
            phoneRaw={phoneRaw}
            className="font-semibold text-maroon hover:text-maroon-dark"
          />
        </div>
        <div>
          <a href={`mailto:${email}`} className="text-maroon hover:text-maroon-dark">
            {email}
          </a>
        </div>
      </address>
    </div>
  );
}
