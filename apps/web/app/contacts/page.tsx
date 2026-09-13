import { query } from '@career-os/db';
import NewContactForm from './new-contact-form';

export const dynamic = 'force-dynamic';

interface ContactListRow {
  id: string;
  companyName: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  source: string | null;
  phoneEventCount: string;
}

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([
    query<ContactListRow>(
      `SELECT ct.id, c.name AS "companyName", ct."firstName", ct."lastName",
              ct.role, ct.email, ct.phone, ct."linkedinUrl", ct.source,
              (SELECT COUNT(*) FROM "PhoneEvent" pe WHERE pe."contactId" = ct.id) AS "phoneEventCount"
       FROM "Contact" ct
       JOIN "Company" c ON c.id = ct."companyId"
       ORDER BY c.name, ct."lastName" NULLS LAST, ct."firstName" NULLS LAST
       LIMIT 200`,
    ),
    query<{ id: string; name: string }>('SELECT id, name FROM "Company" ORDER BY name LIMIT 200'),
  ]);

  return (
    <div>
      <h1>Contacts</h1>
      <p className="muted">
        Recruiter and hiring-team contacts (plan.md section 23). External
        enrichment stays optional — a contact is just structured data linked
        to a company; phone events reference contacts from application pages.
      </p>

      <NewContactForm companies={companies} />

      <div className="card">
        <strong>Contacts ({contacts.length})</strong>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Calls</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>
                  {contact.firstName ?? ''} {contact.lastName ?? ''}
                  {contact.linkedinUrl && (
                    <>
                      {' '}
                      <a href={contact.linkedinUrl} className="muted">
                        [LinkedIn]
                      </a>
                    </>
                  )}
                </td>
                <td>{contact.companyName}</td>
                <td className="muted">{contact.role ?? '—'}</td>
                <td className="muted">{contact.email ?? '—'}</td>
                <td className="muted">{contact.phone ?? '—'}</td>
                <td>{contact.phoneEventCount}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  No contacts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
