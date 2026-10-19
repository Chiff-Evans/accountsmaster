import { useEffect, useRef, useState } from 'react';
import { Button, Space, Tag, Modal, Typography, AutoComplete, Input, Tooltip } from 'antd';
import { AimOutlined, EnvironmentOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { useIsMobile } from '../../hooks/useIsMobile';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [-1.2921, 36.8219]; // Nairobi, Kenya

function MapCanvas({ lat, lng, onChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [searchVal, setSearchVal] = useState('');
  const [options, setOptions] = useState([]);
  const [locating, setLocating] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!containerRef.current) return;

    import('leaflet').then(mod => {
      const L = mod.default || mod;
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const center = lat && lng ? [parseFloat(lat), parseFloat(lng)] : DEFAULT_CENTER;
      const map = L.map(containerRef.current).setView(center, 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const marker = L.marker(center, { draggable: true }).addTo(map);
      const report = latlng => onChange({ lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) });
      marker.on('dragend', e => report(e.target.getLatLng()));
      map.on('click', e => { marker.setLatLng(e.latlng); report(e.latlng); });

      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!markerRef.current || !lat || !lng) return;
    const ll = [parseFloat(lat), parseFloat(lng)];
    markerRef.current.setLatLng(ll);
    mapRef.current?.setView(ll, 15);
  }, [lat, lng]);

  const goTo = (newLat, newLng) => {
    const ll = { lat: parseFloat(newLat).toFixed(6), lng: parseFloat(newLng).toFixed(6) };
    onChange(ll);
    if (markerRef.current) {
      markerRef.current.setLatLng([ll.lat, ll.lng]);
      mapRef.current?.setView([ll.lat, ll.lng], 17);
    }
  };

  const handleSearch = async value => {
    setSearchVal(value);
    if (!value || value.length < 3) { setOptions([]); return; }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=6`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setOptions(data.map(item => ({ value: item.display_name, lat: item.lat, lon: item.lon })));
    } catch { setOptions([]); }
  };

  const handleSelect = (_val, option) => {
    setSearchVal(option.value);
    goTo(option.lat, option.lon);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { goTo(pos.coords.latitude, pos.coords.longitude); setLocating(false); },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Space.Compact style={{ width: '100%' }}>
        <AutoComplete
          value={searchVal}
          options={options}
          onSearch={handleSearch}
          onSelect={handleSelect}
          style={{ flex: 1 }}
          popupMatchSelectWidth={false}
        >
          <Input prefix={<SearchOutlined />} placeholder="Search for a place or address…" allowClear />
        </AutoComplete>
        <Tooltip title="Current Location">
          <Button
            icon={<AimOutlined />}
            loading={locating}
            onClick={useCurrentLocation}
          >
            {isMobile ? null : 'Current Location'}
          </Button>
        </Tooltip>
      </Space.Compact>

      <div
        ref={containerRef}
        style={{ height: 400, width: '100%', borderRadius: 6, border: '1px solid #d9d9d9', overflow: 'hidden' }}
      />

      <Typography.Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
        {lat && lng
          ? <><EnvironmentOutlined style={{ marginRight: 4, color: '#1677ff' }} />{lat}, {lng}</>
          : 'Click on the map or drag the pin to set location'}
      </Typography.Text>
    </div>
  );
}

export default function MapPicker({ lat, lng, onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ lat: '', lng: '' });

  const openModal = () => {
    setDraft({ lat: lat || '', lng: lng || '' });
    setOpen(true);
  };

  const confirm = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <>
      {lat && lng ? (
        <Space>
          <Tag icon={<EnvironmentOutlined />} color="blue" style={{ fontSize: 13, padding: '3px 8px' }}>
            {lat}, {lng}
          </Tag>
          <Button size="small" icon={<EditOutlined />} onClick={openModal}>Change</Button>
        </Space>
      ) : (
        <Button icon={<EnvironmentOutlined />} onClick={openModal}>Pick Location on Map</Button>
      )}

      <Modal
        title={<span><EnvironmentOutlined style={{ marginRight: 8, color: '#1677ff' }} />Pick Location</span>}
        open={open}
        onOk={confirm}
        onCancel={() => setOpen(false)}
        okText="Confirm Location"
        width={680}
        centered
      >
        {open && <MapCanvas lat={draft.lat} lng={draft.lng} onChange={setDraft} />}
      </Modal>
    </>
  );
}
