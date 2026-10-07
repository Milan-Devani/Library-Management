import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMemberById, updateMember } from '../../features/members/memberSlice';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import MemberForm from '../../components/members/MemberForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import toast from 'react-hot-toast';

const MemberEdit = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedMember, loading, actionLoading, error } = useSelector((state) => state.members);

  useEffect(() => {
    if (id) {
      dispatch(fetchMemberById(id));
    }
  }, [id, dispatch]);

  const handleSubmit = async (memberData) => {
    const res = await dispatch(updateMember({ id, memberData }));
    if (updateMember.fulfilled.match(res)) {
      toast.success('Member updated successfully!');
      navigate('/members');
    } else {
      toast.error(res.payload || 'Failed to update member');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading member details..." className="py-20" />;
  }

  if (error || !selectedMember) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <ErrorState
          title="Member Not Found"
          message={error || 'Unable to locate member profile.'}
          onRetry={() => dispatch(fetchMemberById(id))}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Edit Profile: ${selectedMember.full_name}`}
        subtitle={`Updating information for ${selectedMember.member_code}`}
      />

      <Card>
        <MemberForm
          initialData={selectedMember}
          onSubmit={handleSubmit}
          loading={actionLoading}
          onCancel={() => navigate('/members')}
        />
      </Card>
    </div>
  );
};

export default MemberEdit;
