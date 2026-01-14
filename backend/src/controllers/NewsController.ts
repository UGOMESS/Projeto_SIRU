import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class NewsController {
  static async getNews(req: Request, res: Response) {
    try {
      // 1. Configura Axios com Timeout de 5 segundos para evitar travamento do terminal
      const { data } = await axios.get('https://unilab.edu.br/category/noticias/', {
        timeout: 5000, 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
      });

      const $ = cheerio.load(data);
      const newsList: any[] = [];
      const seenTitles = new Set();

      // 2. Busca Ampla de Títulos
      const titleElements = $('h2 a, h3 a'); 

      titleElements.each((i, element) => {
        if (newsList.length >= 5) return;

        const title = $(element).text().trim();
        const link = $(element).attr('href');

        if (!title || !link) return;
        if (seenTitles.has(title)) return;
        if (title.length < 10) return;

        let container = $(element).closest('article');
        if (container.length === 0) container = $(element).closest('div[id*="post-"]');
        if (container.length === 0) container = $(element).parent().parent(); 

        let date = container.find('time').text().trim();
        if (!date) date = container.find('.date, .post-date, .published').text().trim();
        if (!date) date = 'Recente';

        let category = container.find('.cat-links, .post-categories').text().trim();
        if (!category) category = 'Unilab';

        seenTitles.add(title);
        newsList.push({
          id: i,
          title,
          link,
          date,
          category
        });
      });

      return res.json(newsList);

    } catch (error: any) {
      /**
       * LIMPEZA DE LOGS:
       * Em vez de console.error(error), verificamos se é um erro de conexão.
       * Usamos cores no terminal: \x1b[33m (Amarelo) e \x1b[0m (Reset)
       */
      const errorMsg = error.code === 'ECONNABORTED' ? 'Timeout (Lentidão)' : error.code || 'Indisponível';
      console.log("\x1b[33m%s\x1b[0m", `[External Source] Site Unilab: ${errorMsg}.`);
      
      // Retornamos array vazio para o frontend mostrar os "Links Rápidos"
      return res.json([]); 
    }
  }
}