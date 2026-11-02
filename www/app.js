const API = "https://merahputihindoenesiaa.id/wp-json/wp/v2";

let kategoriAktif = 0;

async function ambilBerita(kategori = 0) {
    const area = document.getElementById("feed");
    area.innerHTML = "<p>Memuat berita...</p>";

    try {
        let url = API + "/posts?per_page=20&_embed";

        if (kategori > 0) {
            url += "&categories=" + kategori;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal mengambil berita");

        const posts = await response.json();
        area.innerHTML = "";

        if (!posts.length) {
            area.textContent = "Belum ada berita dalam kategori ini.";
            return;
        }

        posts.forEach(post => {
            const card = document.createElement("article");
            card.className = "post";

            const terms = post._embedded?.["wp:term"]?.[0] || [];

            const label = document.createElement("small");
            label.className = "kategori-label";
            label.textContent = terms.map(x => x.name).join(" • ");

            const judul = document.createElement("h3");
            judul.textContent = post.title.rendered.replace(/<[^>]*>/g, "");

            const tanggal = document.createElement("small");
            tanggal.textContent = new Date(post.date).toLocaleDateString("id-ID");

            const gambar = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

            if (gambar) {
                const img = document.createElement("img");
                img.src = gambar;
                img.alt = judul.textContent;
                img.loading = "lazy";
                card.appendChild(img);
            }

            const ringkasan = document.createElement("p");
            ringkasan.textContent = post.excerpt.rendered
                .replace(/<[^>]*>/g, "")
                .trim();

            const link = document.createElement("a");
            link.href = post.link;
            link.target = "_blank";
            link.rel = "noopener";
            link.textContent = "Baca selengkapnya →";

            card.append(label, judul, tanggal, ringkasan, link);
            area.appendChild(card);
        });

    } catch (error) {
        area.textContent = "Gagal memuat berita. Periksa koneksi internet.";
        console.error(error);
    }
}

async function muatKategori() {
    const area = document.getElementById("kategoriMenu");
    area.innerHTML = "<p>Memuat kategori...</p>";

    try {
        const response = await fetch(
            API + "/categories?per_page=100&hide_empty=true"
        );

        if (!response.ok) throw new Error("Gagal mengambil kategori");

        const categories = await response.json();
        area.innerHTML = "";

        const semua = document.createElement("button");
        semua.className = "category-btn active";
        semua.textContent = "Semua";
        semua.onclick = () => pilihKategori(0, semua);
        area.appendChild(semua);

        categories.forEach(cat => {
            const button = document.createElement("button");
            button.className = "category-btn";
            button.textContent = cat.name;
            button.onclick = () => pilihKategori(cat.id, button);
            area.appendChild(button);
        });

        if (!categories.length) {
            area.innerHTML = "<p>Belum ada kategori berita.</p>";
        }

    } catch (error) {
        area.textContent = "Kategori belum dapat dimuat.";
        console.error(error);
    }
}

function pilihKategori(id, button) {
    kategoriAktif = id;

    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");
    ambilBerita(id);
}

function bukaHalaman(id) {
    document.querySelectorAll(".page").forEach(page => {
        page.hidden = page.id !== id;
    });

    document.querySelectorAll(".navbtn").forEach(button => {
        button.classList.toggle("active", button.dataset.page === id);
    });

    if (id === "home") {
        ambilBerita(kategoriAktif);
    }
}

document.querySelectorAll(".navbtn").forEach(button => {
    button.addEventListener("click", () => {
        bukaHalaman(button.dataset.page);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    muatKategori();
    ambilBerita();
});
