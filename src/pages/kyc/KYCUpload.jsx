import React, { useState } from 'react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Upload, CheckCircle2, Shield, Camera, MapPin } from 'lucide-react';

const KYCUpload = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({
    id_front: null,
    id_back: null,
    selfie: null,
    address_doc: null
  });

  const steps = [
    { id: 1, title: 'Personal ID', icon: Shield, fields: ['id_front', 'id_back'] },
    { id: 2, title: 'Selfie Verification', icon: Camera, fields: ['selfie'] },
    { id: 3, title: 'Proof of Address', icon: MapPin, fields: ['address_doc'] }
  ];

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload to Cloudinary here as per specification
      // For now, we simulate the URL
      setFiles({ ...files, [field]: URL.createObjectURL(file) });
      toast.success(`${field.replace('_', ' ')} uploaded!`);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.post('?action=submit_kyc', {
        tier_requested: 3,
        id_front_url: 'https://cloudinary.com/id_front.jpg',
        id_back_url: 'https://cloudinary.com/id_back.jpg',
        selfie_url: 'https://cloudinary.com/selfie.jpg',
        address_doc_url: 'https://cloudinary.com/address.jpg'
      });
      if (response.data.status === 'success') {
        setStep(4);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('KYC submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-chase-navy">Verify Your Identity</h1>
        <p className="text-gray-500">Complete KYC to unlock full banking features</p>
      </div>

      <div className="flex justify-between mb-8 relative px-4 md:px-0 gap-2">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
        {steps.map((s) => (
          <div key={s.id} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
            step >= s.id ? 'bg-chase-blue text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step > s.id ? <CheckCircle2 size={20} /> : s.id}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-chase-border shadow-lg p-8">
        {step < 4 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-chase-light text-chase-blue rounded-xl">
                {React.createElement(steps[step-1].icon, { size: 28 })}
              </div>
              <h2 className="text-xl font-bold text-chase-navy">{steps[step-1].title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps[step-1].fields.map((field) => (
                <div key={field} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 capitalize">{field.replace('_', ' ')}</label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-chase-blue transition-all group cursor-pointer">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleFileUpload(e, field)}
                    />
                    {files[field] ? (
                      <img src={files[field]} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                    ) : (
                      <>
                        <Upload size={32} className="text-gray-400 group-hover:text-chase-blue mb-2" />
                        <span className="text-xs text-gray-500">Click to upload JPG or PNG</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              {step > 1 && <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">Back</Button>}
              <Button
                onClick={() => step === 3 ? handleSubmit() : setStep(step + 1)}
                loading={loading}
                className="w-full flex-[2]"
              >
                {step === 3 ? 'Submit for Review' : 'Next Step'}
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-12 space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 size={80} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-chase-navy">Submission Received!</h2>
            <p className="text-gray-500">Your documents are under review. This usually takes 24-48 hours. We'll notify you via email once approved.</p>
            <div className="pt-6">
              <Button onClick={() => window.location.href = '/dashboard'} className="w-full">Go to Dashboard</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCUpload;
