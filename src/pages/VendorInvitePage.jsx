import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import { vendor as vendorApi } from '../api/api';

const VendorInvitePage = ({ action }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const memberId = searchParams.get('memberId');
  const token    = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState(null);

  const isAccept = action === 'accept';

  const handleConfirm = async () => {
    if (!memberId || !token) {
      setError('This invite link is invalid or incomplete.');
      return;
    }
    setLoading(true);
    try {
      if (isAccept) {
        await vendorApi.acceptInvite(memberId, token);
        toast.success('Welcome to the team!');
      } else {
        await vendorApi.declineInvite(memberId, token);
        toast.success('Invite declined.');
      }
      setDone(true);
    } catch (err) {
      setError(err.message ?? 'Something went wrong. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const invalid = !memberId || !token;

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 w-full max-w-md text-center">

          {/* Icon */}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${
            isAccept ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <i className={`text-2xl ${
              isAccept
                ? 'fa-solid fa-handshake text-green-700'
                : 'fa-solid fa-xmark text-red-600'
            }`} />
          </div>

          {done ? (
            <>
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                {isAccept ? 'You\'re now a team member!' : 'Invite declined'}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {isAccept
                  ? 'You can now access the vendor dashboard.'
                  : 'You have successfully declined this invitation.'}
              </p>
              <button
                onClick={() => navigate(isAccept ? '/vendor' : '/')}
                className="px-6 py-2.5 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 transition"
              >
                {isAccept ? 'Go to Dashboard' : 'Back to Home'}
              </button>
            </>
          ) : invalid ? (
            <>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Invalid invite link</h2>
              <p className="text-sm text-gray-500 mb-6">
                This link is missing required information. Please use the link from your invitation email.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 transition"
              >
                Back to Home
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                {isAccept ? 'Accept vendor invite' : 'Decline vendor invite'}
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                {isAccept
                  ? 'You have been invited to join a vendor team on Oloja.'
                  : 'You are about to decline a vendor team invitation on Oloja.'}
              </p>
              <p className="text-sm text-gray-400 mb-8">
                {isAccept
                  ? 'Click confirm below to accept and join the team.'
                  : 'Click confirm below to decline this invitation.'}
              </p>

              {error && (
                <p className="text-sm text-red-500 mb-4">{error}</p>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/')}
                  disabled={loading}
                  className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-50 text-white ${
                    isAccept
                      ? 'bg-green-700 hover:bg-green-600'
                      : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {loading ? 'Processing…' : isAccept ? 'Confirm & Accept' : 'Confirm & Decline'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default VendorInvitePage;
