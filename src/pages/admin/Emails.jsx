import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Mail, Send, User, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

const Emails = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch the list of users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('?action=admin_get_users_emails');
        if (response.data.status === 'success') {
          setUsers(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedUser(response.data.data[0]);
          }
        } else {
          toast.error(response.data.message || 'Failed to fetch user directory');
        }
      } catch (err) {
        toast.error('Network error loading users list');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error('Please select an email recipient');
      return;
    }
    if (!subject.trim() || !message.trim()) {
      toast.error('Please complete both Subject and Message fields');
      return;
    }

    setSending(true);
    const toastId = toast.loading('Sending secure email template...');

    try {
      const response = await api.post('?action=admin_send_custom_email', {
        name: selectedUser.full_name,
        email: selectedUser.email,
        subject: subject,
        message: message
      });

      if (response.data.status === 'success') {
        toast.success(response.data.message || 'Email successfully sent!', { id: toastId });
        setSubject('');
        setMessage('');
      } else {
        toast.error(response.data.message || 'Failed to dispatch email', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error executing email transmission', { id: toastId });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Mail className="text-chase-blue" size={32} />
          Email Communications
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Send a securely brand-styled email message to system users.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <form onSubmit={handleSend} className="space-y-5">
            {/* User Recipient selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Recipient User
              </label>
              {loadingUsers ? (
                <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={18} />
                  </span>
                  <select
                    className="w-full bg-slate-50 hover:bg-slate-100/60 border border-slate-200 focus:border-chase-blue focus:ring-2 focus:ring-chase-blue/20 rounded-xl py-3 pl-12 pr-10 text-sm font-medium text-slate-800 outline-none appearance-none transition-all cursor-pointer"
                    value={selectedUser ? selectedUser.id : ''}
                    onChange={(e) => {
                      const found = users.find(u => u.id == e.target.value);
                      if (found) setSelectedUser(found);
                    }}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.email})
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={18} />
                  </span>
                </div>
              )}
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Subject line
              </label>
              <input
                type="text"
                required
                placeholder="Important Security Update regarding your account"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-chase-blue focus:ring-2 focus:ring-chase-blue/20 rounded-xl py-3 px-4 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>

            {/* Message Body Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Secure message content
              </label>
              <textarea
                required
                rows={8}
                placeholder="Write your email body here. Standard line-breaks are preserved as natural paragraphs..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-chase-blue focus:ring-2 focus:ring-chase-blue/20 rounded-xl py-3 px-4 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending || loadingUsers}
              className="w-full bg-chase-blue hover:bg-chase-blue/90 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-chase-blue/20 hover:shadow-chase-blue/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:scale-100"
            >
              {sending ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending email secure transmission...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Secured Brand Email
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Sidebar / Live Template Previewer */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-slate-100 space-y-4 shadow-md">
            <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-2">
              <CheckCircle2 size={16} />
              Secured Template Format
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              This message will be injected into our custom institutional email template before delivery. Features include:
            </p>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4 font-medium">
              <li>Header with "Starling Crest Finance" logo</li>
              <li>Signature brand primary accent bar</li>
              <li>Secure link to the customer dashboard</li>
              <li>Helpful custom support links for the user</li>
            </ul>
          </div>

          <div className="bg-orange-50/60 rounded-2xl border border-orange-100 p-5 space-y-3">
            <h3 className="text-sm font-bold text-chase-navy flex items-center gap-2">
              <AlertCircle className="text-chase-blue" size={18} />
              Secure Delivery Disclaimer
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              All communications are routed through the secure SMTP server config as set in our core environment config. Ensure that your recipient information is accurate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emails;
