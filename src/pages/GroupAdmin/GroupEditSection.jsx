export default function GroupEditSection({ name, setName,
    desc, setDesc,
    imgPreview, setImgFile }) {
    return (
        <section className="ga-edit">
            <label>Name *</label>
            <input value={name} maxLength={100}
                onChange={e => setName(e.target.value)} />

            <label>Description</label>
            <textarea value={desc} maxLength={500}
                onChange={e => setDesc(e.target.value)} />

            <label>Image</label>
            {imgPreview && <img src={imgPreview}
                alt="preview"
                style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '4px' }} />}
            <input type="file" accept="image/*"
                onChange={e => setImgFile(e.target.files[0])} />
        </section>
    );
}
