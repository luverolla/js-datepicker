/**
 * @param {Date} a 
 * @param {Date} b 
 * @returns {boolean}
 */
function dateEquals(a,b)
{
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

class JDatePicker
{
	/**
	 * @type {HTMLInputElement}
	 */
	old;

	/**
	 * @type {HTMLDivElement}
	 */
	el;

	/**
	 * @type {string}
	 */
	name;

	/**
	 * @type {string}
	 */
	id;

	/**
	 * @type {Date}
	 */
	minDate;

	/**
	 * @type {Date}
	 */
	maxDate;

    /**
     * @type {Date[]}
     */
    disabledDates;

	/**
	 * @type {string}
	 */
	lang

	/**
	 * @type {Date} 
	 */
	curr;

	/**
	 * @type {Date} 
	 */
	selected;

	/**
	 * @type {string} 
	 */
	prevValue;

    /**
     * @type {boolean} 
     */
    keyEvent;

    /**
     * @type {object} 
     */
    locale;

    /**
     * @type {string}
     */
    format;

    /**
     * @type {RegExp}
     */
    regexp;


    // ====>UTILITY FUNCTIONS<====

    /**
     * @param {Date} d 
     * @returns {boolean}
    */
    dateIsValid(d)
    {
        return (
            !Number.isNaN(d) &&
            d >= this.minDate &&
            d <= this.maxDate &&
            !this.dateIsDisabled(d)
        );
    }

    /**
     * @param {Date} d 
     * @returns {boolean}
     */
    dateIsDisabled(d)
    {
        for(let i = 0; i < this.disabledDates.length; i++)
            if(dateEquals(d, this.disabledDates[i]))
                return true;

        return false;
    }

    /**
     * @param {Date} d 
     * @returns {string}
    */
    dateToString(d)
    {
        return this.format
                .replace('d', d.getDate())
                .replace('m', d.getMonth() + 1)
                .replace('y', d.getFullYear());
    }

    /**
     * @param {string} s
     * @returns {Date|null}
    */
    stringToDate(s)
    {
        if(!this.regexp.test(s))
            return null;

        let pcs = this.format.split(this.format[1]),
            pieces = s.split(this.format[1]),
            day = pieces[pcs.indexOf('d')],
            month = pieces[pcs.indexOf('m')],
            year = pieces[pcs.indexOf('y')],
            date = new Date(`${year}-${month}-${day}`);

        if(Number.isNaN(date))
            return null;

        return date;
    }

    /**
     * @param {Date} d
     * @returns {string}
     */
    getMonthYear(d)
    {
        return d.toLocaleDateString(
            this.lang,
            { month: "long", year: "numeric" }
        );
    }

    // ====>CONSTRUCTOR<====

	/**
	 * @param {HTMLInputElement} old
	 */
	constructor(old)
	{
		this.old = old;
		this.prevValue = old.value;

		this.lang = old.dataset.locale || "en";
        this.locale = window.JDATEPICKER_LOCALES[this.lang];

        this.format = old.dataset.format || "y-m-d";
        this.regexp = this.format.replace(/([a-z])/g, "([0-9]+)");
        this.regexp = new RegExp(this.regexp);

		this.name = old.name || Date.now().toString();
		this.id = `jdatepicker-${this.name}`;

        this.disabledDates = [];
		this.minDate = new Date(0);
		this.maxDate = new Date(64060588800000);

        this.keyEvent = false;
		this.curr = new Date();

        if(old.hasAttribute("data-disableddates"))
            this.disabledDates = old.dataset.disableddates.split(',')
                                    .map(d => this.stringToDate(d));

		if(old.hasAttribute("data-mindate"))
			this.minDate = this.stringToDate(old.dataset.mindate);

		if(old.hasAttribute("data-maxdate"))
			this.maxDate = this.stringToDate(old.dataset.maxdate);

		if(old.hasAttribute("data-current"))
			this.curr = this.stringToDate(old.dataset.current);
	}

    // ====>EVENTS<====

	keyboardEvents()
	{
		this.el.addEventListener("keydown", e =>
		{
            switch(e.key)
            {
                case "PageUp":
				    e.shiftKey ? this.prevYear() : this.prevMonth();
                    break;

                case "PageDown":
                    e.shiftKey ? this.nextYear() : this.nextMonth();
                    break;

                case "ArrowRight":
                    this.nextDay();
                    break;

                case "ArrowDown":
                    this.nextWeek();
                    break;

                case "ArrowLeft":
                    this.prevDay();
                    break;

                case "ArrowUp":
                    this.prevWeek();
                    break;

                case "Enter":
                    e.preventDefault();
                    this.selectDate(this.curr.toLocaleDateString(this.lang));
                    break;

                case "Escape":
                    this.close();
            }
		});
	}

	mouseEvents()
	{
		let cells = this.el.querySelectorAll("[data-date]");

		cells.forEach(c =>
		{
			if(!c.classList.contains("disabled"))
            {
				c.addEventListener("click", () =>
                {
                    this.selectDate(c.dataset.date)
                });
            }
		});

        window.addEventListener("mousedown", e =>
        {
            if(!this.el.contains(e.target))
                this.close();
        })
	}

    inputEvents()
    {
        this.old.addEventListener("change", () =>
		{
			let value = this.old.value,
                date = this.stringToDate(value);

			if(!date || date < this.minDate || date > this.maxDate)
				this.old.value = value.length === 0 ? "" : this.prevValue;

			else
			{
                this.selectDate(value);
                this.setDate(date);
            }
		});
    }

    focusEvents()
    {
        window.addEventListener("blur", () =>
        {
            if(!this.el.contains(document.activeElement))
                this.close();
        });
    }

    // ====>ORDINARY FUNCTIONS<====

	/**
	 * @param {string} str 
	 */
	selectDate(str)
	{
		this.old.value = str;
		this.prevValue = str;
        this.curr = this.stringToDate(str);
		this.selected = this.stringToDate(str);

        this.old.dispatchEvent(new CustomEvent("jdatepicker-change"));
	}

    prevWeek()
    {
        let d = new Date(this.curr);

        d.setDate(d.getDate() - 7);

        if(d < this.minDate)
            return;

        while(this.dateIsDisabled(d))
        {
            d.setDate(d.getDate() - 1);

            if(d > this.maxDate)
                return;
        }

		this.setDate(d);
    }

    prevDay()
    {
        let d = new Date(this.curr);

        d.setDate(d.getDate() - 1);

        if(d < this.minDate)
            return;

        while(this.dateIsDisabled(d))
        {
            d.setDate(d.getDate() - 1);

            if(d < this.minDate)
                return;
        }

		this.setDate(d);
    }

    nextDay()
    {
        let d = new Date(this.curr);

        d.setDate(d.getDate() + 1);

        if(d > this.maxDate)
            return;

        while(this.dateIsDisabled(d))
        {
            d.setDate(d.getDate() + 1);

            if(d > this.maxDate)
                return;
        }

		this.setDate(d);
    }

    nextWeek()
    {
        let d = new Date(this.curr);

        d.setDate(d.getDate() + 7);

        if(d > this.maxDate)
            return;

        while(this.dateIsDisabled(d))
        {
            d.setDate(d.getDate() + 1);

            if(d > this.maxDate)
                return;
        }

		this.setDate(d);
    }

	prevYear()
	{
		let d = new Date(this.curr);

        d.setFullYear(d.getFullYear() - 1);

        if(d < this.minDate)
            return;

        while(this.dateIsDisabled(d))
        {
            d.setDate(d.getDate() - 1);

            if(d < this.minDate)
                return;
        }

		this.setDate(d);
	}

	prevMonth()
	{
		let d = new Date(this.curr);

        d.setMonth(d.getMonth() - 1);

        if(d < this.minDate)
            return;

        while(this.dateIsDisabled(d))
        {
            d.setDate(d.getDate() - 1);

            if(d < this.minDate)
                return;
        }

		this.setDate(d);
	}

	nextMonth()
	{
		let d = new Date(this.curr);

        d.setMonth(d.getMonth() + 1);

        if(d > this.maxDate)
            return;

        while(this.dateIsDisabled(d))
        {
            d.setDate(d.getDate() + 1);

            if(d > this.maxDate)
                return;
        }

		this.setDate(d);
	}

	nextYear()
	{
		let d = new Date(this.curr);

        d.setFullYear(d.getFullYear() + 1);

        if(d > this.maxDate)
            return;

        while(this.dateIsDisabled(d))
        {
            d.setDate(d.getDate() + 1);

            if(d > this.maxDate)
                return;
        }

		this.setDate(d);
	}

	/**
	 * @param {Date} d 
	 */
	setDate(d)
	{
        this.curr = d;
        this.updateGrid();
	}

    open()
    {
        this.el.classList.add("open");

        let date = this.dateToString(this.curr),
            which = this.el.querySelector(`[data-date='${date}']`);

        which.focus();
        which.tabIndex = 0;
    }

    close()
    {
        this.el.classList.remove("open");
    }

    // ====>RENDERING<====

	/**
	 * @returns {HTMLDivElement}
	 */
	renderHeader()
	{
		let header = document.createElement("div");
		header.classList.add(`jdatepicker__header`);

		let prevYear = document.createElement("button");
		prevYear.type = "button";
		prevYear.onclick = () => this.prevYear();
		prevYear.classList.add(`jdatepicker__prevYear`);
		prevYear.setAttribute("aria-label", this.locale.PREV_YEAR);
		prevYear.innerHTML = "<i class='la la-angle-double-left'/>";

		let prevMonth = document.createElement("button");
		prevMonth.type = "button";
		prevMonth.onclick = () => this.prevMonth();
		prevMonth.classList.add(`jdatepicker__prevMonth`);
		prevMonth.setAttribute("aria-label", this.locale.PREV_MONTH);
		prevMonth.innerHTML = "<i class='la la-angle-left'/>";

		let currMY = document.createElement("h2");
		currMY.id = `${this.id}_label`;
		currMY.setAttribute("aria-live", "polite");
		currMY.innerHTML = this.getMonthYear(this.curr);

		let nextMonth = document.createElement("button");
		nextMonth.type = "button";
		nextMonth.onclick = () => this.nextMonth();
		nextMonth.innerHTML = "<i class='la la-angle-right'/>";
		nextMonth.classList.add(`jdatepicker__nextMonth`);
		nextMonth.setAttribute("aria-label", this.locale.NEXT_MONTH);

		let nextYear = document.createElement("button");
		nextYear.type = "button";
		nextYear.onclick = () => this.nextYear();
		nextYear.innerHTML = "<i class='la la-angle-double-right'/>";
		nextYear.classList.add(`jdatepicker__nextYear`);
		nextYear.setAttribute("aria-label", this.locale.NEXT_YEAR);

		header.appendChild(prevYear);
		header.appendChild(prevMonth);
		header.appendChild(currMY);
		header.appendChild(nextMonth);
		header.appendChild(nextYear);

		return header;
	}

    updateGrid()
    {
        let base = new Date(this.curr),
            cells = this.el.querySelectorAll("td"),
            label = this.el.querySelector(`#${this.id}_label`);

        label.innerText = this.getMonthYear(this.curr);

        base.setDate(1);
        while(base.getDay() > 1)
            base.setDate(base.getDate() - 1);

        cells.forEach(el =>
        {
            let isCurrMonth = base.getMonth() === this.curr.getMonth();

            el.innerText = base.getDate();
            el.dataset.date = this.dateToString(base);

            if(isCurrMonth && this.dateIsValid(base))
                el.classList.remove("disabled");
            else
                el.classList.add("disabled");

            if(dateEquals(base, new Date()))
                el.classList.add("today");
            else
                el.classList.remove("today");

            if(dateEquals(base, this.curr))
            {
                el.focus();
                el.tabIndex = 0;
            }

            else el.tabIndex = -1;

            base.setDate(base.getDate() + 1);
        });

        this.mouseEvents();
    }

	/**
	 * @returns {HTMLTableElement}
	 */
	renderGrid()
	{
		let grid = document.createElement("table"),
            head = document.createElement("thead"),
            body = document.createElement("tbody"),
            hrow = document.createElement("tr");

		grid.classList.add(`jdatepicker__grid`);
		grid.setAttribute("role", "grid");
		grid.setAttribute("aria-labelledby", `${this.id}_label`);

        head.appendChild(hrow);
        grid.appendChild(head);
        grid.appendChild(body);

		this.locale.DAYS.forEach(d =>
		{
			let cell = document.createElement("th");
			cell.scope = "col";
			cell.innerText = d.slice(0,2);
			cell.setAttribute("abbr", d);

			hrow.appendChild(cell);
		});

		for(let i = 0; i < 6; i++)
		{
			let row = document.createElement("tr");

			for(let j = 0; j < 7; j++)
                row.appendChild(document.createElement("td"));

			body.appendChild(row);
		}

		return grid;
	}

    // ====>INIT<====

	init()
	{
		this.el = document.createElement("div");
		this.el.id = this.id;
		this.el.classList.add("jdatepicker");
		this.el.setAttribute("role", "dialog");
		this.el.setAttribute("aria-modal", true);
		this.el.setAttribute("aria-label", this.locale.CHOOSE_DATE);

		this.el.appendChild(this.renderHeader());
		this.el.appendChild(this.renderGrid());
        this.updateGrid();

        let offTop = this.el.offsetTop,
			winHeight = window.innerHeight;

		if(offTop >= .5 * winHeight)
			this.el.classList.add("reverse");

        let cnt = document.createElement("div");
        cnt.classList.add(`jdatepicker__container`);

        let btn = document.createElement("button");
        btn.classList.add(`jdatepicker__button`);
        btn.innerHTML = "<i class='la la-calendar-o'/>";
        btn.setAttribute("aria-label", this.locale.OPEN_PICKER);
        btn.type = "button";

        btn.onclick = () => this.open();

        let parent = this.old.parentElement,
            next = this.old.nextElementSibling;

        cnt.appendChild(this.old);
        cnt.appendChild(btn);
        cnt.appendChild(this.el);

        this.old.removeAttribute("data-format");
		this.old.removeAttribute("data-replace");
		this.old.removeAttribute("data-locale");

		parent.insertBefore(cnt, next);

        this.keyboardEvents();
        this.focusEvents();
        this.mouseEvents();
        this.inputEvents();

        window.dispatchEvent(new CustomEvent("jdatepicker-create"));
	}
}

document.addEventListener("DOMContentLoaded", () =>
{
    if(!window.JDATEPICKER_INSTANCES)
        window.JDATEPICKER_INSTANCES = {};

    document.querySelectorAll("[data-replace='datepicker']").forEach(el =>
    {
        let dp = new JDatePicker(el);
        window.JDATEPICKER_INSTANCES[dp.name] = dp;
        dp.init();
    });
});