import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Select, Switch, Tag, Button, Tooltip, message } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import CrudTable from '../../components/common/CrudTable';
import LabelField from '../../components/common/LabelField';
import api from '../../api';

export default function Parameters() {
  const [parameters, setParameters] = useState([]);
  const [pLoading, setPLoading] = useState(false);
  const [pOpen, setPOpen] = useState(false);
  const [pEditing, setPEditing] = useState(null);
  const [pForm] = Form.useForm();

  const [selected, setSelected] = useState(null); // parameter currently being viewed
  const [valuesModalOpen, setValuesModalOpen] = useState(false);
  const [values, setValues] = useState([]);
  const [vLoading, setVLoading] = useState(false);
  const [vOpen, setVOpen] = useState(false);
  const [vEditing, setVEditing] = useState(null);
  const [vForm] = Form.useForm();
  const [allValues, setAllValues] = useState([]); // every parameter_value, for the Parent Value picker

  const loadParameters = useCallback(async () => {
    setPLoading(true);
    try {
      const r = await api.get('/parameters');
      setParameters(r.data);
    } finally { setPLoading(false); }
  }, []);

  const parameterNameById = id => parameters.find(p => p.id === id)?.parameter_name || '';
  const parentValueOptions = allValues
    .filter(v => v.id !== vEditing?.id)
    .map(v => ({ value: v.id, label: `${parameterNameById(v.parameter_id)}: ${v.paramater_value}` }));

  const loadValues = useCallback(async parameterId => {
    setVLoading(true);
    try {
      const r = await api.get('/parameters/values', { params: { parameter_id: parameterId, include_inactive: 1 } });
      setValues(r.data);
    } finally { setVLoading(false); }
  }, []);

  useEffect(() => {
    loadParameters();
    api.get('/parameters/values').then(r => setAllValues(r.data));
  }, [loadParameters]);

  const onSaveParameter = async () => {
    const vals = await pForm.validateFields();
    try {
      if (pEditing) await api.put(`/parameters/${pEditing.id}`, vals);
      else await api.post('/parameters', vals);
      message.success('Saved');
      setPOpen(false);
      loadParameters();
    } catch { message.error('Failed to save'); }
  };

  const onSaveValue = async () => {
    const vals = await vForm.validateFields();
    try {
      // The Edit Value form has no parameter_id field (it's fixed by which
      // parameter you're viewing), so it must be passed through explicitly
      // here — otherwise it's missing from the PUT body entirely.
      if (vEditing) await api.put(`/parameters/values/${vEditing.id}`, { ...vals, parameter_id: vEditing.parameter_id });
      else await api.post('/parameters/values', { ...vals, parameter_id: selected.id });
      message.success('Saved');
      setVOpen(false);
      loadValues(selected.id);
      api.get('/parameters/values').then(r => setAllValues(r.data));
    } catch { message.error('Failed to save'); }
  };

  const parameterCols = [
    { title: 'Parameter Name', dataIndex: 'parameter_name', key: 'name' },
    { title: 'Text ID',        dataIndex: 'text_id',         key: 'text_id', mobileExpanded: true, render: v => v ? <code>{v}</code> : null },
    { title: 'Description',   dataIndex: 'description',      key: 'desc',    mobileExpanded: true },
    { title: 'Active',        dataIndex: 'is_active',        key: 'active',  mobileExpanded: true,
      render: v => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
  ];

  const valueCols = [
    { title: 'Value',       dataIndex: 'paramater_value', key: 'value' },
    { title: 'Parent Value', dataIndex: 'parent_value_name', key: 'parent', mobileExpanded: true,
      render: v => v ? <Tag color="purple">{v}</Tag> : <span style={{ color: '#bbb' }}>—</span> },
    { title: 'Description', dataIndex: 'description',     key: 'desc',   mobileExpanded: true },
    { title: 'Default',     dataIndex: 'is_default',      key: 'default', mobileExpanded: true,
      render: v => v ? <Tag color="gold">Default</Tag> : null },
    { title: 'Active',      dataIndex: 'is_active',       key: 'active', mobileExpanded: true,
      render: v => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
  ];

  return (
    <>
      <CrudTable
        title="Parameters"
        columns={parameterCols}
        dataSource={parameters}
        loading={pLoading}
        onAdd={() => { setPEditing(null); pForm.resetFields(); setPOpen(true); }}
        onEdit={r => { setPEditing(r); pForm.setFieldsValue({ ...r, is_active: !!r.is_active }); setPOpen(true); }}
        onDelete={async r => {
          try { await api.delete(`/parameters/${r.id}`); message.success('Deleted'); loadParameters();
                if (selected?.id === r.id) setValuesModalOpen(false); }
          catch { message.error('Cannot delete — it still has values'); }
        }}
        onRefresh={loadParameters}
        searchPlaceholder="Search parameters..."
        extraActions={r => (
          <Tooltip title="View Values">
            <Button
              type="link" size="small" icon={<UnorderedListOutlined />}
              onClick={() => { setSelected(r); loadValues(r.id); setValuesModalOpen(true); }}
            />
          </Tooltip>
        )}
      />

      {/* Values Modal — pops up the values grid for the selected parameter */}
      <Modal
        title={`Values — ${selected?.parameter_name ?? ''}`}
        open={valuesModalOpen}
        onCancel={() => setValuesModalOpen(false)}
        footer={null}
        width={800}
        centered
        destroyOnHidden
      >
        <CrudTable
          height={420}
          columns={valueCols}
          dataSource={values}
          loading={vLoading}
          onAdd={() => { setVEditing(null); vForm.resetFields(); setVOpen(true); }}
          onEdit={r => { setVEditing(r); vForm.setFieldsValue({ ...r, is_active: !!r.is_active, is_default: !!r.is_default }); setVOpen(true); }}
          onDelete={async r => {
            try { await api.delete(`/parameters/values/${r.id}`); message.success('Deleted'); loadValues(selected.id); }
            catch { message.error('Cannot delete'); }
          }}
          onRefresh={() => loadValues(selected.id)}
          searchPlaceholder="Search values..."
        />
      </Modal>

      {/* Parameter Modal */}
      <Modal
        title={pEditing ? 'Edit Parameter' : 'Add Parameter'}
        open={pOpen}
        onOk={onSaveParameter}
        onCancel={() => setPOpen(false)}
        centered
      >
        <Form form={pForm} layout="vertical">
          <LabelField label="Parameter Name" required>
            <Form.Item name="parameter_name" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Text ID">
            <Form.Item name="text_id" style={{ marginBottom: 20 }}>
              <Input placeholder="e.g. trip_statuses" />
            </Form.Item>
          </LabelField>

          <LabelField label="Description">
            <Form.Item name="description" style={{ marginBottom: 20 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </LabelField>

          {pEditing && (
            <Form.Item name="is_active" label="Active" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Parameter Value Modal — nests visually above the Values modal it's
          opened from. The Values modal uses destroyOnHidden (so its search/
          pagination resets per parameter), which tears down and recreates
          its DOM node on every open — that can leave it appended *after*
          this modal's node, and at equal z-index, later-in-DOM wins. An
          explicit higher zIndex makes the stacking order deterministic
          regardless of mount order. */}
      <Modal
        title={vEditing ? 'Edit Value' : 'Add Value'}
        open={vOpen}
        onOk={onSaveValue}
        onCancel={() => setVOpen(false)}
        zIndex={1050}
        centered
      >
        <Form form={vForm} layout="vertical">
          <LabelField label="Value" required>
            <Form.Item name="paramater_value" rules={[{ required: true }]} style={{ marginBottom: 20 }}>
              <Input />
            </Form.Item>
          </LabelField>

          <LabelField label="Parent Value (optional)" tooltip="If this value is a child of another value, select the parent here.">
            <Form.Item
              name="parent_value_id"
              style={{ marginBottom: 20 }}
            >
              <Select
                allowClear showSearch optionFilterProp="label"
                placeholder="None"
                options={parentValueOptions}
              />
            </Form.Item>
          </LabelField>

          <LabelField label="Description">
            <Form.Item name="description" style={{ marginBottom: 20 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </LabelField>

          <Form.Item
            name="is_default"
            label="Default"
            valuePropName="checked"
            tooltip="The value forms pre-select automatically for this parameter. Only one value per parameter can be the default."
            style={{ marginBottom: vEditing ? 20 : 0 }}
          >
            <Switch />
          </Form.Item>

          {vEditing && (
            <Form.Item name="is_active" label="Active" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}
