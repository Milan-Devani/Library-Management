import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createMember } from '../../features/members/memberSlice';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import MemberForm from '../../components/members/MemberForm';
import toast from 'react-hot-toast';

const MemberCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading } = useSelector((state) => state.members);

  const handleSubmit = async (memberData) => {
    const res = await dispatch(createMember(memberData));
    if (createMember.fulfilled.match(res)) {
      toast.success('Member created successfully!');
      navigate('/members');
    } else {
      toast.error(res.payload || 'Failed to create member');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Register New Member / Student"
        subtitle="Create a new library card profile with borrowing privileges"
      />

      <Card>
        <MemberForm
          onSubmit={handleSubmit}
          loading={actionLoading}
          onCancel={() => navigate('/members')}
        />
      </Card>
    </div>
  );
};

export default MemberCreate;
