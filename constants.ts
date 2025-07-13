

import { NavItem, Disposition, DispositionModifier, Agent, Show, Association } from './types';
import DashboardIcon from './components/icons/DashboardIcon';
import UsersIcon from './components/icons/UsersIcon';
import ChartBarIcon from './components/icons/ChartBarIcon';
import UploadIcon from './components/icons/UploadIcon';
import DownloadIcon from './components/icons/DownloadIcon';
import IdentificationIcon from './components/icons/IdentificationIcon';
import TagIcon from './components/icons/TagIcon';
import TicketIcon from './components/icons/TicketIcon';
import LibraryIcon from './components/icons/LibraryIcon';
import UserCogIcon from './components/icons/UserCogIcon';
import DocumentTextIcon from './components/icons/DocumentTextIcon';

export const NAV_LINKS: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: DashboardIcon },
  { path: '/customers', label: 'Customers', icon: UsersIcon },
  { path: '/reports', label: 'Reports', icon: ChartBarIcon },
  { path: '/import', label: 'Import', icon: DownloadIcon },
  { path: '/advanced-imports', label: 'Paids', icon: DocumentTextIcon },
  { path: '/export', label: 'Export', icon: UploadIcon },
  { path: '/agents', label: 'Agents', icon: IdentificationIcon },
  { path: '/dispositions', label: 'Dispositions', icon: TagIcon },
  { path: '/shows', label: 'Shows', icon: TicketIcon },
  { path: '/associations', label: 'Associations', icon: LibraryIcon },
  { path: '/users', label: 'Users', icon: UserCogIcon, adminOnly: true },
];

export const DEFAULT_AGENT: Agent = { id: 'agent-0', agentNumber: 0, firstName: 'Office', lastName: '', isDefault: true };
export const DEFAULT_DISPOSITION: Disposition = { id: 'disp-0', name: 'No Disposition', modifiers: [], isDefault: true };
export const DEFAULT_ASSOCIATION: Association = { id: 'assoc-0', associationId: 'PFF', associationName: 'P.F.F.P.N.C.', associatedCity: 'North Carolina', phone: '(919)977-0348', isDefault: true };
export const DEFAULT_SHOW: Show = { id: 'show-0', showNumber: 0, showName: 'No Show', startDate: '', endDate: '', venues: [], isDefault: true };

export const DISPOSITION_MODIFIERS_INFO: { key: DispositionModifier; name: string; description: string }[] = [
  { key: DispositionModifier.DNC, name: 'DNC', description: 'Do Not Call. Customer will never be exported.' },
  { key: DispositionModifier.Sale, name: 'Sale', description: 'Indicates a sale was made to the customer.' },
  { key: DispositionModifier.Payment, name: 'Payment', description: 'Indicates a payment was received from the customer.' },
  { key: DispositionModifier.Invoice, name: 'Invoice', description: 'Customer requires an invoice to be sent.' },
  { key: DispositionModifier.TimeOut, name: 'TimeOut', description: 'Puts the customer in a temporary export timeout for a specified number of days.' },
  { key: DispositionModifier.ExcludeCount, name: 'Exclude Count', description: 'Excludes a customer after a set number of attempts. Can optionally apply a DNC or TimeOut status afterward.' },
  { key: DispositionModifier.Cancel, name: 'Cancel', description: 'Cancels an open order if a payment has not yet been received.' },
];

export const INITIAL_DISPOSITIONS: Omit<Disposition, 'id' | 'isDefault'>[] = [
    { name: '30 Day', modifiers: [DispositionModifier.TimeOut], timeOutDays: 30 },
    { name: '7 Day', modifiers: [DispositionModifier.TimeOut], timeOutDays: 7 },
    { name: 'Appointment', modifiers: [] },
    { name: 'Cant Talk', modifiers: [] },
    { name: 'Credit', modifiers: [DispositionModifier.Payment, DispositionModifier.Sale, DispositionModifier.Invoice] },
    { name: 'Flag', modifiers: [DispositionModifier.Invoice] },
    { name: 'Junk', modifiers: [DispositionModifier.ExcludeCount], excludeAfterAttempts: 2, excludeAction: 'DNC' },
    { name: 'Kick Out', modifiers: [DispositionModifier.TimeOut, DispositionModifier.Cancel], timeOutDays: 120 },
    { name: 'Processed', modifiers: [DispositionModifier.Payment, DispositionModifier.Sale, DispositionModifier.Invoice] },
    { name: 'Ran', modifiers: [DispositionModifier.Payment] },
    { name: 'ReMail', modifiers: [DispositionModifier.Invoice] },
    { name: 'Remove', modifiers: [DispositionModifier.DNC] },
    { name: 'Sale', modifiers: [DispositionModifier.Sale, DispositionModifier.Invoice] },
    { name: 'Turndown', modifiers: [DispositionModifier.TimeOut], timeOutDays: 120 },
    { name: 'Verified Credit', modifiers: [DispositionModifier.Payment, DispositionModifier.Sale, DispositionModifier.Invoice] },
    { name: 'Verified Sale', modifiers: [DispositionModifier.Sale, DispositionModifier.Invoice] },
    { name: 'Voicemail', modifiers: [] },
    { name: 'Will Mail', modifiers: [DispositionModifier.TimeOut], timeOutDays: 30 },
    { name: 'Abandon', modifiers: [] },
    { name: 'AMD Hangup', modifiers: [] },
    { name: 'AMD Silence', modifiers: [] },
    { name: 'Answering Machine', modifiers: [] },
    { name: 'Broadcasted', modifiers: [] },
    { name: 'Busy', modifiers: [DispositionModifier.ExcludeCount], excludeAfterAttempts: 2, excludeAction: 'DNC' },
    { name: 'Cancel Order', modifiers: [DispositionModifier.Cancel] },
    { name: 'Disconnected', modifiers: [DispositionModifier.ExcludeCount], excludeAfterAttempts: 2, excludeAction: 'DNC' },
    { name: 'Failed', modifiers: [DispositionModifier.ExcludeCount], excludeAfterAttempts: 2, excludeAction: 'DNC' },
    { name: 'IVR Script Finished', modifiers: [] },
    { name: 'No Answer', modifiers: [] },
    { name: 'Not Complete', modifiers: [] },
    { name: 'Preview Call Refused', modifiers: [] },
];

export const INITIAL_ASSOCIATIONS: Omit<Association, 'id' | 'isDefault'>[] = [
    { associationId: 'ASH', associationName: 'Asheville Firefighters Assoc.', associatedCity: 'Asheville', phone: '(828)333-5211' },
    { associationId: 'BOO', associationName: 'P.F.F.P.N.C.', associatedCity: 'Boone', phone: '(828)333-5211' },
    { associationId: 'CHA', associationName: 'Mecklenburg Co. Firefighters Assoc.', associatedCity: 'Mecklenburg', phone: '(704)331-9075' },
    { associationId: 'CON', associationName: 'Cabarrus Co. Firefighters Assoc.', associatedCity: 'Cabarrus', phone: '(704)331-9075' },
    { associationId: 'DUR', associationName: 'Durham Firefighters Assoc.', associatedCity: 'Durham', phone: '(919)977-0348' },
    { associationId: 'FAY', associationName: 'Fayetteville Firefighters Assoc.', associatedCity: 'Fayetteville', phone: '(919)977-0348' },
    { associationId: 'GAS', associationName: 'P.F.F.P.N.C.', associatedCity: 'Gastonia', phone: '(704)331-9075' },
    { associationId: 'HIC', associationName: 'P.F.F.P.N.C.', associatedCity: 'Hickory', phone: '(704)331-9075' },
    { associationId: 'HPT', associationName: 'High Point Firefighters Assoc.', associatedCity: 'High Point', phone: '(704)331-9075' },
    { associationId: 'JAC', associationName: 'Jacksonville Firefighters Assoc.', associatedCity: 'Jacksonville', phone: '(919)977-0348' },
    { associationId: 'KIN', associationName: 'Kinston Firefighters Assoc.', associatedCity: 'Kinston', phone: '(919)977-0348' },
    { associationId: 'LEX', associationName: 'Lexington Firefighters Assoc.', associatedCity: 'Lexington', phone: '(704)331-9075' },
    { associationId: 'LLF', associationName: 'P.F.F.P.N.C.', associatedCity: 'Leland', phone: '(919)977-0348' },
    { associationId: 'LIN', associationName: 'Lincolnton Firefighters Assoc.', associatedCity: 'Lincolnton', phone: '(704)331-9075' },
    { associationId: 'MOO', associationName: 'P.F.F.P.N.C.', associatedCity: 'Mooresville', phone: '(704)331-9075' },
    { associationId: 'RAL', associationName: 'P.F.F.P.N.C.', associatedCity: 'Raleigh', phone: '(919)977-0348' },
    { associationId: 'STA', associationName: 'Statesville Firefighters Assoc.', associatedCity: 'Statesville', phone: '(704)331-9075' },
    { associationId: 'WLM', associationName: 'New Hanover Co. Firefighters Assoc.', associatedCity: 'New Hanover', phone: '(919)977-0348' },
    { associationId: 'WSF', associationName: 'Winston-Salem Firefighters Assoc.', associatedCity: 'Winston-Salem', phone: '(704)331-9075' },
    { associationId: 'NHC', associationName: 'New Hanover Co. Firefighters Assoc.', associatedCity: 'New Hanover County', phone: '(919)977-0348' }
];

export const DEFAULT_INVOICE_TEMPLATE = `
VISIT US AT:PFFPNCCONCERTS.ORG
                                             {associationPhone}



{currentDate}           {phone}  {showNumber} {coldPc}

      {agentName}                   \${amount}
                                     {tickets}

{title} {firstName} {lastName}
{address}
{city}, {state} {zip}


WE DEEPLY APPRECIATE YOUR SUPPORT FOR OUR FIREFIGHTERS!



{centeredAssociationName}

{currentDate}           {phone}  {showNumber} {coldPc}

      {agentName}                   \${amount}
                                     {tickets}
{title} {firstName} {lastName}
{address}
{city}, {state} {zip}

                                             {mailByDate}















`;