import { useEffect, useState } from 'react';
import { App, Modal, Form, Input, InputNumber, Select } from 'antd';
import FieldWrapper from './FieldWrapper';
import MultiFileUploadField from './common/MultiFileUploadField';
import api from '../api';

function parseIds(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
}

/* Shared "New/Edit Campaign" form — used from both the campaigns list (New)
   and the campaign detail page (Edit), so the form itself lives here once. */
export default function CampaignFormModal({ open, editing, onClose, onSaved }) {
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const [campaignTypes, setCampaignTypes] = useState([]); // parameter_id 19
  const [durationUnits, setDurationUnits] = useState([]); // parameter_id 20
  const [audiences, setAudiences] = useState([]);          // parameter_id 21
  const [countries, setCountries] = useState([]);           // parameter_id 15
  const [counties, setCounties] = useState([]);             // parameter_id 16
  const [subcounties, setSubcounties] = useState([]);       // parameter_id 17

  const [posterFiles, setPosterFiles] = useState([]);
  const [existingPosters, setExistingPosters] = useState([]);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);

  useEffect(() => {
    api.get('/parameters/values', { params: { parameter_id: 19 } }).then(r => setCampaignTypes(r.data));
    api.get('/parameters/values', { params: { parameter_id: 20 } }).then(r => setDurationUnits(r.data));
    api.get('/parameters/values', { params: { parameter_id: 21 } }).then(r => setAudiences(r.data));
    api.get('/parameters/values', { params: { parameter_id: 15 } }).then(r => setCountries(r.data));
    api.get('/parameters/values', { params: { parameter_id: 16 } }).then(r => setCounties(r.data));
    api.get('/parameters/values', { params: { parameter_id: 17 } }).then(r => setSubcounties(r.data));
  }, []);

  useEffect(() => {
    if (!open) return;
    setPosterFiles([]); setAttachmentFiles([]);
    if (editing) {
      setExistingPosters(parseIds(editing.posters));
      setExistingAttachments(parseIds(editing.attachments));
      form.setFieldsValue({
        campaign_title: editing.campaign_title, campaign_type_id: editing.campaign_type_id, description: editing.description,
        website_link: editing.website_link, whatsapp_number: editing.whatsapp_number, promo_code: editing.promo_code,
        duration_value: editing.duration_value, duration_unit_id: editing.duration_unit_id,
        target_audience: parseIds(editing.target_audience), target_country_id: editing.target_country_id,
        target_county_id: editing.target_county_id, target_subcounty_id: editing.target_subcounty_id,
        budget: editing.budget, comments: editing.comments,
      });
    } else {
      setExistingPosters([]); setExistingAttachments([]);
      form.resetFields();
      // Prefill whichever value staff have explicitly marked as default per parameter.
      form.setFieldsValue({
        campaign_type_id:    campaignTypes.find(c => c.is_default)?.id,
        duration_unit_id:    durationUnits.find(u => u.is_default)?.id,
        target_country_id:      countries.find(c => c.is_default)?.id,
        target_county_id:        counties.find(c => c.is_default)?.id,
        target_subcounty_id:  subcounties.find(c => c.is_default)?.id,
      });
    }
  }, [open, editing]);

  const selectedTargetCountyId = Form.useWatch('target_county_id', form);
  const subcountiesForTargetCounty = subcounties.filter(s => s.parent_value_id === selectedTargetCountyId);

  const onSave = async () => {
    const vals = await form.validateFields();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries({
        campaign_title: vals.campaign_title, campaign_type_id: vals.campaign_type_id ?? '',
        description: vals.description || '', website_link: vals.website_link || '',
        whatsapp_number: vals.whatsapp_number || '', promo_code: vals.promo_code || '',
        duration_value: vals.duration_value ?? '', duration_unit_id: vals.duration_unit_id ?? '',
        target_country_id: vals.target_country_id ?? '', target_county_id: vals.target_county_id ?? '',
        target_subcounty_id: vals.target_subcounty_id ?? '', budget: vals.budget ?? '', comments: vals.comments || '',
      }).forEach(([k, v]) => formData.append(k, v));
      formData.append('target_audience', JSON.stringify(vals.target_audience || []));
      formData.append('existing_posters', JSON.stringify(existingPosters));
      formData.append('existing_attachments', JSON.stringify(existingAttachments));
      posterFiles.forEach(f => formData.append('posters', f));
      attachmentFiles.forEach(f => formData.append('attachments', f));

      if (editing) await api.put(`/campaigns/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/campaigns', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      message.success('Saved');
      onSaved?.();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      title={editing ? 'Edit Campaign' : 'New Campaign'}
      open={open} onOk={onSave} onCancel={onClose} confirmLoading={saving} centered width={560}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <FieldWrapper label="Campaign Title" required>
          <Form.Item name="campaign_title" rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0 }}>
            <Input variant="borderless" style={{ padding: '2px 0' }} />
          </Form.Item>
        </FieldWrapper>

        <FieldWrapper label="Campaign Type">
          <Form.Item name="campaign_type_id" style={{ marginBottom: 0 }}>
            <Select variant="borderless" allowClear showSearch optionFilterProp="children" style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}>
              {campaignTypes.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
            </Select>
          </Form.Item>
        </FieldWrapper>

        <FieldWrapper label="Description">
          <Form.Item name="description" style={{ marginBottom: 0 }}>
            <Input.TextArea variant="borderless" rows={3} style={{ padding: '2px 0' }} />
          </Form.Item>
        </FieldWrapper>

        {/* <FieldWrapper label="Website Link"> */}
          <Form.Item name="website_link" style={{ marginBottom: 0 }} hidden={true}>
            <Input variant="borderless" placeholder="https://…" style={{ padding: '2px 0' }} />
          </Form.Item>
        {/* </FieldWrapper> */}

        <FieldWrapper label="WhatsApp Number">
          <Form.Item name="whatsapp_number" style={{ marginBottom: 0 }}>
            <Input variant="borderless" style={{ padding: '2px 0' }} />
          </Form.Item>
        </FieldWrapper>

        {/* <FieldWrapper label="Promo Code" > */}
          <Form.Item name="promo_code" style={{ marginBottom: 0 }}hidden={true}>
            <Input variant="borderless" style={{ padding: '2px 0' }} />
          </Form.Item>
        {/* </FieldWrapper> */}

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <FieldWrapper label="Duration">
              <Form.Item name="duration_value" style={{ marginBottom: 0 }}>
                <InputNumber variant="borderless" min={0} style={{ width: '100%' }} />
              </Form.Item>
            </FieldWrapper>
          </div>
          <div style={{ flex: 1 }}>
            <FieldWrapper label="Unit">
              <Form.Item name="duration_unit_id" style={{ marginBottom: 0 }}>
                <Select variant="borderless" allowClear showSearch optionFilterProp="children" style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}>
                  {durationUnits.map(u => <Select.Option key={u.id} value={u.id}>{u.paramater_value}</Select.Option>)}
                </Select>
              </Form.Item>
            </FieldWrapper>
          </div>
        </div>

        <FieldWrapper label="Target Audience">
          <Form.Item name="target_audience" style={{ marginBottom: 0 }}>
            <Select mode="multiple" variant="borderless" allowClear showSearch optionFilterProp="children" style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}>
              {audiences.map(a => <Select.Option key={a.id} value={a.id}>{a.paramater_value}</Select.Option>)}
            </Select>
          </Form.Item>
        </FieldWrapper>

        <FieldWrapper label="Target Country">
          <Form.Item name="target_country_id" style={{ marginBottom: 0 }}>
            <Select variant="borderless" allowClear showSearch optionFilterProp="children" style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}>
              {countries.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
            </Select>
          </Form.Item>
        </FieldWrapper>

        <FieldWrapper label="Target County">
          <Form.Item name="target_county_id" style={{ marginBottom: 0 }}>
            <Select
              variant="borderless" allowClear showSearch optionFilterProp="children"
              style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}
              onChange={() => form.setFieldValue('target_subcounty_id', undefined)}
            >
              {counties.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
            </Select>
          </Form.Item>
        </FieldWrapper>

        <FieldWrapper label="Target Sub-County">
          <Form.Item name="target_subcounty_id" style={{ marginBottom: 0 }}>
            <Select
              variant="borderless" allowClear showSearch optionFilterProp="children"
              style={{ marginLeft: -7, width: 'calc(100% + 7px)' }}
              disabled={!selectedTargetCountyId}
              placeholder={selectedTargetCountyId ? 'Select sub-county' : 'Select a county first'}
            >
              {subcountiesForTargetCounty.map(c => <Select.Option key={c.id} value={c.id}>{c.paramater_value}</Select.Option>)}
            </Select>
          </Form.Item>
        </FieldWrapper>

        {/* <FieldWrapper label="Budget"> */}
          <Form.Item name="budget" style={{ marginBottom: 0 }}hidden={true}>
            <InputNumber variant="borderless" min={0} style={{ width: '100%' }} />
          </Form.Item>
        {/* </FieldWrapper> */}

        <FieldWrapper label="Comments">
          <Form.Item name="comments" style={{ marginBottom: 0 }}>
            <Input.TextArea variant="borderless" rows={2} style={{ padding: '2px 0' }} />
          </Form.Item>
        </FieldWrapper>

        <FieldWrapper label="Posters">
          <MultiFileUploadField
            existingItems={existingPosters.map(u => ({ url: u, name: u.split('/').pop() }))}
            onRemoveExisting={i => setExistingPosters(prev => prev.filter((_, idx) => idx !== i))}
            files={posterFiles}
            onAddFiles={fs => setPosterFiles(prev => [...prev, ...fs])}
            onRemoveFile={i => setPosterFiles(prev => prev.filter((_, idx) => idx !== i))}
            accept="image/*" imageGrid maxSizeMB={10} maxCount={10}
            hint="JPG, PNG or WEBP · up to 10 images, 10MB each"
          />
        </FieldWrapper>

        <FieldWrapper label="Other Attachments" style={{ marginBottom: 0 }}>
          <MultiFileUploadField
            existingItems={existingAttachments.map(u => ({ url: u, name: u.split('/').pop() }))}
            onRemoveExisting={i => setExistingAttachments(prev => prev.filter((_, idx) => idx !== i))}
            files={attachmentFiles}
            onAddFiles={fs => setAttachmentFiles(prev => [...prev, ...fs])}
            onRemoveFile={i => setAttachmentFiles(prev => prev.filter((_, idx) => idx !== i))}
            maxSizeMB={10} maxCount={10}
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.ppt,.pptx,"
            hint="Images, PDF, Word, PowerPoint· up to 10 files, 10MB each"
          />
        </FieldWrapper>
      </Form>
    </Modal>
  );
}
